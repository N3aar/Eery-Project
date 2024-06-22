import {
	type TranslationKey,
	embedColors,
	translations,
	discordTimestampFormats,
} from "@/utils/contants.js";
import { convertToDiscordTimestamp } from "@/utils/dateFormat.js";
import { shuffle } from "@/utils/random.js";
import { removeAccents, shuffleString } from "@/utils/stringFormat.js";
import type { Jumble } from "@prisma/client";
import { container } from "@sapphire/pieces";
import {
	type ActionRow,
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonComponent,
	type ButtonInteraction,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	type InteractionCollector,
	type Message,
} from "discord.js";
import type { ArtistData } from "../types/musicBrainzTypes.js";

export enum JumbleStatus {
	STARTING = 0,
	PLAYING = 1,
	WINNER = 2,
	GIVEUP = 3,
}

export type JumbleGameContext = {
	message?: Message;
	embed?: EmbedBuilder;
	collector?: InteractionCollector<ButtonInteraction>;
	hints: string[];
	ownerId: string;
	ownerName: string;
	status: JumbleStatus;
	artistName: string;
	cleanArtistName: string;
	started: number;
	additionalHints: number;
};

export type ArtistInfo = {
	isGroup: boolean;
	type: TranslationKey | null;
	gender: TranslationKey | null;
	musicGenre: string | undefined;
	country: string | null;
	begin: string | null;
	end: string | null;
};

enum ButtonCustomIds {
	ADD_HINT = "addHint",
	RESHUFFLE = "reshuffle",
	GIVE_UP = "giveup",
}

export default class JumbleGameHandler {
	jumble: Map<string, JumbleGameContext>;

	constructor() {
		this.jumble = new Map();
	}

	public getJumbleGameContext(
		channelId: string,
	): JumbleGameContext | undefined {
		return this.jumble.get(channelId);
	}

	public hasJumble(channelId: string): boolean {
		return this.jumble.has(channelId);
	}

	public async createJumbleContext(
		channelId: string,
		ownerId: string,
		ownerName: string,
		playcount: number,
		name: string,
		mbid?: string | null,
	): Promise<JumbleGameContext | null> {
		const artistInfo = await this.getArtistInfo(name, mbid);
		if (!artistInfo) return null;

		const hints = this.createHints(
			playcount,
			artistInfo.type,
			artistInfo.country,
			artistInfo.musicGenre,
			artistInfo.gender,
			artistInfo.begin,
			artistInfo.end,
		);

		const gameContext: JumbleGameContext = {
			hints,
			ownerId,
			ownerName,
			artistName: name,
			cleanArtistName: removeAccents(name.toLowerCase()),
			status: JumbleStatus.STARTING,
			additionalHints: 0,
			started: Date.now(),
		};

		this.jumble.set(channelId, gameContext);
		return gameContext;
	}

	public deleteJamGame(channelId: string) {
		this.jumble.delete(channelId);
	}

	public async getUserStats(memberId: string): Promise<Jumble | null> {
		try {
			const user = await container.db.user.findUnique({
				where: {
					discordId: memberId,
				},
				select: {
					id: true,
					Jumble: true,
				},
			});

			if (!user) return null;
			if (user.Jumble) return user.Jumble;

			const newJumble = await container.db.jumble.create({
				data: {
					userId: user.id,
				},
			});

			return newJumble;
		} catch (error) {
			return null;
		}
	}

	public startJumble(channelId: string, message: Message, embed: EmbedBuilder) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext) return;

		gameContext.message = message;
		gameContext.embed = embed;
		gameContext.collector = this.createButtonCollector(message);
		gameContext.status = JumbleStatus.PLAYING;
	}

	public createComponents(disabledHints: boolean) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(ButtonCustomIds.ADD_HINT)
				.setLabel("Add Dica")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabledHints),
			new ButtonBuilder()
				.setCustomId(ButtonCustomIds.RESHUFFLE)
				.setLabel("Reorganizar")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(ButtonCustomIds.GIVE_UP)
				.setLabel("Desistir")
				.setStyle(ButtonStyle.Secondary),
		);
	}

	private createButtonCollector(message: Message) {
		const channelId = message.channel.id;
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 25_000,
		});

		collector.on(
			"collect",
			async (interaction) =>
				await this.processInteraction(interaction, channelId),
		);

		collector.on("end", async (collected) => await this.finishGame(channelId));

		return collector;
	}

	private createHints(
		playcount: number,
		type: TranslationKey | null,
		country: string | null,
		musicGenre: string | undefined,
		gender: TranslationKey | null,
		begin: string | null,
		end: string | null,
	): string[] {
		const hints: string[] = [];
		const isGroup = type ? this.isGroupType(type) : false;

		const beginTimestamp = begin
			? convertToDiscordTimestamp(begin, discordTimestampFormats.LONG_DATE)
			: null;
		const endTimestamp = end
			? convertToDiscordTimestamp(end, discordTimestampFormats.LONG_DATE)
			: null;

		const arttype = translations[type ?? "group"];
		const artgender = translations[gender ?? "male"];
		const flag = `:flag_${country?.toLowerCase()}:`;

		const conditionsAndHints: [boolean, string][] = [
			[true, `- Você tem **${playcount}** reproduções deste artista`],
			[!!type, `- Eles são um(a) **${arttype}**`],
			[!!country, `- O país deles tem esta bandeira: ${flag}`],
			[!!musicGenre, `- Um dos gêneros musicais deles é **${musicGenre}**`],
			[isGroup && !!beginTimestamp, `- Eles começaram em ${beginTimestamp}`],
			[isGroup && !!endTimestamp, `- Eles pararam em ${endTimestamp}`],
			[!isGroup && !!gender, `- O gênero dele(a) é **${artgender}**`],
			[!isGroup && !!beginTimestamp, `- Ele(a) nasceu em ${beginTimestamp}`],
			[!isGroup && !!endTimestamp, `- Ele(a) faleceu em ${endTimestamp}`],
		];

		for (const [condition, hint] of conditionsAndHints) {
			if (condition) hints.push(hint);
		}

		return shuffle(hints);
	}

	private isGroupType(artistType: string): boolean {
		return artistType === "group";
	}

	private async getArtistInfo(
		artistName: string,
		mbid?: string | null,
	): Promise<ArtistInfo | null> {
		try {
			const artist: ArtistData | null = mbid
				? await container.musicBrainzAPI.getArtistInfo(mbid)
				: await container.musicBrainzAPI.searchArtist(artistName);

			if (!artist) return null;

			const lifespan = artist["life-span"];
			const type = artist.type?.toLowerCase() as TranslationKey | null;
			const isGroup = type ? this.isGroupType(type) : false;
			const gender = artist.gender?.toLowerCase() as TranslationKey | null;
			const genres = artist.tags?.length
				? artist.tags.sort((tagA, tagB) => tagB.count - tagA.count)
				: null;

			return {
				isGroup,
				gender,
				type,
				musicGenre: genres?.[0]?.name,
				country: artist.country,
				begin: lifespan?.begin,
				end: lifespan?.end,
			};
		} catch (error) {
			console.error("Error fetching artist info:", error);
			return null;
		}
	}

	private async addPoints(userId: string, points: number) {
		await container.db.jumble.update({
			where: {
				userId: userId,
			},
			data: {
				points: {
					increment: points,
				},
			},
		});
	}

	private async setBestTime(userId: string, time: number) {
		await container.db.jumble.update({
			where: {
				userId: userId,
			},
			data: {
				bestTime: time,
			},
		});
	}

	private async addHint(gameContext: JumbleGameContext) {
		const defaultHintsCount = 3;
		const hintsCount = gameContext.additionalHints + defaultHintsCount;
		const maxHints = gameContext.hints.length;

		if (!gameContext.embed || hintsCount > maxHints) return;

		gameContext.additionalHints++;

		const hints = gameContext.hints.slice(0, hintsCount).join("\n");
		const addHints = gameContext.additionalHints;

		const extraHints = addHints > 1 ? "dicas extras" : "dica extra";
		const fieldTitle = `Dicas +${addHints} ${extraHints}`;
		const field = {
			name: fieldTitle,
			value: hints,
			inline: false,
		};

		const newEmbed = gameContext.embed.spliceFields(0, 1, field);
		const component = gameContext.message?.components[0];

		const newMessage = {
			embeds: [newEmbed],
			components: [
				hintsCount + 1 > maxHints
					? this.createComponents(true)
					: (component as ActionRow<ButtonComponent>),
			],
		};

		await gameContext?.message?.edit(newMessage);
	}

	private async reshuffle(gameContext: JumbleGameContext) {
		const message = gameContext.message;
		const embed = gameContext.embed;

		if (!embed || !message) return;

		const artistName = gameContext.artistName.toUpperCase();
		const reshuffled = shuffleString(artistName);
		const newEmbed = embed.setDescription(`\`${reshuffled}\``);

		await message.edit({
			embeds: [newEmbed],
		});
	}

	private async giveUp(
		gameContext: JumbleGameContext,
		interaction: ButtonInteraction,
	) {
		const message = gameContext.message;
		const collector = gameContext.collector;

		if (!message || !collector) return;

		const ownerId = gameContext.ownerId;
		const userId = interaction.user.id;

		if (ownerId !== userId) {
			const embed = new EmbedBuilder()
				.setDescription("Você não pode desistir do jogo de outra pessoa.")
				.setColor(embedColors.default);

			interaction.reply({
				embeds: [embed],
				ephemeral: true,
				fetchReply: false,
			});

			return;
		}

		await interaction.deferUpdate();
		gameContext.status = JumbleStatus.GIVEUP;
		collector.stop();
	}

	public async winGame(
		channelId: string,
		winnerId: string,
		winnerName: string,
	) {
		const gameContext = this.getJumbleGameContext(channelId);
		const message = gameContext?.message;

		if (!gameContext || !message) return;

		const artist = gameContext.artistName;
		const passed = Date.now() - gameContext.started;
		const seconds = Number.parseFloat((passed / 1000).toFixed(1));
		const description = `**${winnerName}** acertou! A resposta foi \`${artist}\``;

		const userData = await container.db.user.findUnique({
			where: { discordId: winnerId },
			select: {
				id: true,
				Jumble: true,
			},
		});

		if (!userData || !userData.Jumble) return;

		await this.addPoints(userData.id, 1);

		const bestTime = userData.Jumble.bestTime;

		if (seconds > bestTime) {
			await this.setBestTime(userData.id, seconds);
		}

		gameContext.status = JumbleStatus.WINNER;

		const embed = new EmbedBuilder()
			.setDescription(description)
			.setFooter({ text: `Respondido em ${seconds}s` })
			.setColor(embedColors.success);

		await message.channel.send({
			embeds: [embed],
		});
	}

	private async processInteraction(
		interaction: ButtonInteraction,
		channelId: string,
	) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext) return;

		const customId = interaction.customId;

		switch (customId) {
			case ButtonCustomIds.ADD_HINT:
				await interaction.deferUpdate();
				await this.addHint(gameContext);
				break;

			case ButtonCustomIds.RESHUFFLE:
				await interaction.deferUpdate();
				await this.reshuffle(gameContext);
				break;

			case ButtonCustomIds.GIVE_UP:
				await this.giveUp(gameContext, interaction);
				break;
		}
	}

	private async finishGame(channelId: string) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext) return;

		this.deleteJamGame(channelId);

		const message = gameContext.message;
		const embed = gameContext.embed;
		const guild = message?.guild;

		if (!message || !embed || !guild) return;

		const { ownerName, status, artistName } = gameContext;
		const isWinner = status === JumbleStatus.WINNER;
		const isGiveUp = status === JumbleStatus.GIVEUP;

		const color = isWinner ? embedColors.success : embedColors.error;
		const title = isGiveUp ? `${ownerName} desistiu!` : "O tempo acabou!";

		const newField = {
			name: title,
			value: `A resposta correta era **${artistName}**`,
			inline: false,
		};

		embed.setColor(color);

		if (isWinner) embed.spliceFields(1, 1);
		else embed.spliceFields(1, 1, newField);

		await message.edit({
			embeds: [embed],
			components: [],
		});
	}
}
