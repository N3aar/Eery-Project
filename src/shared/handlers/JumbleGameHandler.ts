import {
	type TranslationKey,
	embedColors,
	translations,
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
	TextChannel,
} from "discord.js";
import { discordTimestampFormats } from "../types/discordTypes.js";
import type { ArtistData } from "../types/musicBrainzTypes.js";

export type JumbleField = "points" | "bestTime" | "plays";

export enum JumbleStatus {
	STARTING = 0,
	PLAYING = 1,
	WINNER = 2,
	GIVEUP = 3,
	STOPPED = 4,
}

type JumbleGameContext = {
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

type ArtistInfo = {
	isGroup?: boolean;
	musicGenre?: string;
	type?: TranslationKey | null;
	gender?: TranslationKey | null;
	country?: string | null;
	begin?: string | null;
	end?: string | null;
};

enum ButtonCustomIds {
	ADD_HINT = "addHint",
	RESHUFFLE = "reshuffle",
	GIVE_UP = "giveup",
}

export default class JumbleGameHandler {
	jumble: Map<string, JumbleGameContext | undefined>;
	users: Map<string, Jumble>;

	constructor() {
		this.jumble = new Map();
		this.users = new Map();
	}

	public getJumbleGameContext(
		channelId: string,
	): JumbleGameContext | undefined {
		return this.jumble.get(channelId);
	}

	public hasJumble(channelId: string): boolean {
		this.checkAndStopIdleJumble(channelId);
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
		const artistInfo: ArtistInfo = (await this.getArtistInfo(name, mbid)) ?? {};
		const hints = this.createHints(playcount, artistInfo);

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

	public allocateChannel(channelId: string) {
		this.jumble.set(channelId, undefined);
	}

	public deleteJumbleGame(channelId: string) {
		this.jumble.delete(channelId);
	}

	public stopJumble(channelId: string) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext) return;

		gameContext.status = JumbleStatus.STOPPED;
		gameContext.collector?.stop();

		this.deleteJumbleGame(channelId);
	}

	private checkAndStopIdleJumble(channelId: string) {
		const gameContext = this.getJumbleGameContext(channelId);

		if (!gameContext) return;

		const now = Date.now();
		const past = now - gameContext?.started;
		const fortySeconds = 40000;

		if (past > fortySeconds) {
			this.stopJumble(channelId);
		}
	}

	private async fetchUserStats(memberId: string): Promise<Jumble | null> {
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
				userId: memberId,
			},
		});

		return newJumble;
	}

	public async getUserStats(memberId: string): Promise<Jumble | null> {
		const userStats =
			this.users.get(memberId) ?? (await this.fetchUserStats(memberId));

		if (userStats && !this.users.has(memberId)) {
			this.users.set(memberId, userStats);
		}

		return userStats;
	}

	public async getLeaderboard(field: JumbleField, max: number) {
		const orderBy = { [field]: field === "bestTime" ? "asc" : "desc" };
		const where = { [field]: { gt: 0 } };
		const query = {
			where,
			orderBy,
			include: {
				user: true,
			},
			take: Math.min(max, 25),
		};

		return container.db.jumble.findMany(query);
	}

	public startJumble(channelId: string, message: Message, embed: EmbedBuilder) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext || gameContext.status === JumbleStatus.STOPPED) return;

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

		collector.on("collect", async (interaction) =>
			this.processInteraction(interaction, channelId),
		);

		collector.on("end", async (collected) => await this.finishGame(channelId));

		return collector;
	}

	private createHints(playcount: number, artistInfo: ArtistInfo): string[] {
		const { type, country, musicGenre, gender, begin, end } = artistInfo;

		const hints: string[] = [];
		const isGroup = type ? this.isGroupType(type) : false;

		const beginTimestamp = begin
			? convertToDiscordTimestamp(begin, discordTimestampFormats.LONG_DATE)
			: null;
		const endTimestamp = end
			? convertToDiscordTimestamp(end, discordTimestampFormats.LONG_DATE)
			: null;

		const arttype = translations[type ?? "group"] ?? type;
		const artgender = translations[gender ?? "male"] ?? gender;
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

	private async updateUserStats(memberId: string, updateData: Partial<Jumble>) {
		const userStats = await this.getUserStats(memberId);
		if (!userStats) return;

		Object.assign(userStats, updateData);

		await container.db.jumble.update({
			where: {
				id: userStats.id,
			},
			data: updateData,
		});

		this.users.set(memberId, userStats);
	}

	public async addPlay(memberId: string, plays: number) {
		const userStats = await this.getUserStats(memberId);
		if (!userStats) return;
		await this.updateUserStats(memberId, { plays: userStats.plays + plays });
	}

	private async addPoints(memberId: string, points: number) {
		const userStats = await this.getUserStats(memberId);
		if (!userStats) return;
		await this.updateUserStats(memberId, { points: userStats.points + points });
	}

	private async setBestTime(memberId: string, time: number) {
		await this.updateUserStats(memberId, { bestTime: time });
	}

	private async addHint(gameContext: JumbleGameContext) {
		const defaultHintsCount = 3;
		const hintsCount = gameContext.additionalHints + defaultHintsCount;
		const maxHints = gameContext.hints.length;

		if (!gameContext.embed || hintsCount > maxHints) return;

		gameContext.additionalHints++;

		const hints = gameContext.hints.slice(0, hintsCount + 1).join("\n");
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
				hintsCount + 1 >= maxHints
					? this.createComponents(true)
					: (component as ActionRow<ButtonComponent>),
			],
		};

		gameContext?.message?.edit(newMessage);
	}

	private async reshuffle(gameContext: JumbleGameContext) {
		const message = gameContext.message;
		const embed = gameContext.embed;

		if (!embed || !message) return;

		const artistName = gameContext.artistName.toUpperCase();
		const reshuffled = shuffleString(artistName);
		const newEmbed = embed.setDescription(`\`${reshuffled}\``);

		message.edit({
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
				flags: ["Ephemeral"],
				fetchReply: false,
			});

			return;
		}

		interaction.deferUpdate();
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
		const collector = gameContext?.collector;

		if (!gameContext || !message || !collector) return;

		const artist = gameContext.artistName;
		const passed = Date.now() - gameContext.started;
		const seconds = Number.parseFloat((passed / 1000).toFixed(1));
		const description = `**${winnerName}** acertou! A resposta foi \`${artist}\``;

		gameContext.status = JumbleStatus.WINNER;
		collector.stop();

		const userData = await this.getUserStats(winnerId);

		if (!userData) return;

		await this.addPoints(winnerId, 1);

		const bestTime = userData.bestTime;

		if (bestTime <= 0 || seconds < bestTime) {
			await this.setBestTime(winnerId, seconds);
		}

		const channel = message.channel;

		const embed = new EmbedBuilder()
			.setDescription(description)
			.setFooter({ text: `Respondido em ${seconds}s` })
			.setColor(embedColors.success);

		if (channel instanceof TextChannel) {
			channel.send({ embeds: [embed] });
		}
	}

	private processInteraction(
		interaction: ButtonInteraction,
		channelId: string,
	) {
		const gameContext = this.getJumbleGameContext(channelId);
		if (!gameContext) return;

		const customId = interaction.customId;

		switch (customId) {
			case ButtonCustomIds.ADD_HINT:
				interaction.deferUpdate();
				this.addHint(gameContext);
				break;

			case ButtonCustomIds.RESHUFFLE:
				interaction.deferUpdate();
				this.reshuffle(gameContext);
				break;

			case ButtonCustomIds.GIVE_UP:
				this.giveUp(gameContext, interaction);
				break;
		}
	}

	private async finishGame(channelId: string) {
		const gameContext = this.getJumbleGameContext(channelId);
		this.deleteJumbleGame(channelId);

		if (!gameContext) return;

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

		if (!isWinner && !isGiveUp) {
			const failEmbed = new EmbedBuilder()
				.setDescription(`Ninguém adivinhou. A resposta era \`${artistName}\``)
				.setColor(embedColors.error);

			message.reply({ embeds: [failEmbed] });
		}

		message.edit({
			embeds: [embed],
			components: [],
		});
	}
}
