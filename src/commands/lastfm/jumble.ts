import type { UserArtistData } from "@/shared/integrations/LastFmAPI.js";
import { embedColors } from "@/utils/contants.js";
import { getRandomNumber } from "@/utils/random.js";
import { shuffleString } from "@/utils/stringFormat.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, type GuildMember, type TextChannel } from "discord.js";

export class JumbleCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName("jumble").setDescription("Descubra o artista"),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member = interaction.member as GuildMember;
		const channel = interaction.channel as TextChannel;

		if (!member || !channel) return;

		const alreadyPlaying = this.container.jumbleGameHandler.hasJumble(
			channel.id,
		);

		if (alreadyPlaying) {
			const embed = new EmbedBuilder()
				.setDescription("Outro jogo está em andamento neste canal no momento.")
				.setColor(embedColors.default);

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
				fetchReply: false,
			});

			return;
		}

		const userStats = await this.container.jumbleGameHandler.getUserStats(
			member.id,
		);
		if (!userStats) {
			await interaction.reply({
				content:
					"Você não possui um registro! Envie uma mensagem no canal antes de executar este comando.",
				ephemeral: true,
				fetchReply: false,
			});

			return;
		}

		const username = userStats.lastfmUser;
		if (!username) {
			const embed = new EmbedBuilder()
				.setDescription(
					"Use o comando /lastfm para registrar sua conta antes de jogar.",
				)
				.setColor(embedColors.default);

			await interaction.reply({
				embeds: [embed],
				ephemeral: false,
				fetchReply: false,
			});

			return;
		}

		const totalArtists =
			await this.container.lastFmAPI.getTotalArtists(username);
		const totalPages = Math.ceil((totalArtists ?? 100) / 100);
		const twentyPercent = Math.floor(totalPages / 2);

		const page = getRandomNumber(1, Math.max(totalPages - twentyPercent, 1));
		const artists = await this.container.lastFmAPI.getTopArtists(
			username,
			100,
			page,
		);

		const randomArtist = artists && this.chooseRandomArtist(artists);

		if (!randomArtist) {
			await interaction.reply({
				content: "Nenhum artista encontrado!",
				ephemeral: false,
				fetchReply: false,
			});
			return;
		}

		const channelId = channel.id;
		const ownerId = member.id;
		const ownerName = member.displayName;

		const artistName = shuffleString(randomArtist.name.toUpperCase());
		const gameContext =
			await this.container.jumbleGameHandler.createJumbleContext(
				channelId,
				ownerId,
				ownerName,
				randomArtist.playcount,
				randomArtist.name,
				randomArtist.mbid,
			);

		if (!gameContext) {
			await interaction.reply({
				content: "Não foi encontrado informações sobre o artista!",
				ephemeral: false,
				fetchReply: false,
			});
			return;
		}

		const defaultHintsCount = 3;
		const hintsCount = gameContext.additionalHints + defaultHintsCount;
		const allHints = hintsCount >= gameContext.hints.length;

		const row = this.container.jumbleGameHandler.createComponents(allHints);
		const firstHints = gameContext.hints.slice(0, 3);

		const embed = new EmbedBuilder()
			.setTitle("Adivinhe o artista - Jumble")
			.setDescription(`\`${artistName}\``)
			.setColor(embedColors.playing)
			.addFields([
				{
					name: "Dicas",
					value: firstHints.join("\n"),
					inline: false,
				},
				{
					name: "Add resposta",
					value: "Digite sua resposta em 25 segundos para fazer uma tentativa.",
					inline: false,
				},
			]);

		const message = await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: false,
			fetchReply: true,
		});

		this.container.jumbleGameHandler.startJumble(
			message.channel.id,
			message,
			embed,
		);

		await this.container.db.jumble.update({
			where: {
				id: userStats.id,
			},
			data: {
				plays: {
					increment: 1,
				},
			},
		});
	}

	private chooseRandomArtist(artists: UserArtistData[]) {
		if (artists && artists.length > 0) {
			const randomIndex = Math.floor(Math.random() * artists.length);
			const randomArtist = artists[randomIndex];
			return randomArtist;
		}
	}
}
