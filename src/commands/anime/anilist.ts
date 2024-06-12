import type { Media, MediaType } from "@/shared/types/anilistTypes.js";
import { embedColors } from "@/utils/contants.js";
import { formatDate } from "@/utils/dateFormat.js";
import { pascal, replaceUnderlines } from "@/utils/stringFormat.js";
import { Command } from "@sapphire/framework";
import { type APIEmbedField, EmbedBuilder, type TextChannel } from "discord.js";

export class AnilistCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("anilist")
				.setDescription("Mostrar informações de um anime")
				.addStringOption((option) => {
					option.setName("busca");
					option.setDescription("Nome da obra a ser procurado");
					option.setRequired(true);
					return option;
				})
				.addStringOption((option) => {
					option.setName("formato");
					option.setDescription("Formato a ser procurado");
					option.setRequired(false);
					option.addChoices([
						{
							name: "Anime",
							value: "ANIME",
						},
						{
							name: "Manga",
							value: "MANGA",
						},
					]);
					return option;
				})
				.addStringOption((option) => {
					option.setName("info");
					option.setDescription("Formato das informações");
					option.setRequired(false);
					option.addChoices([
						{
							name: "Resumido",
							value: "resume",
						},
						{
							name: "Detalhado",
							value: "details",
						},
					]);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const mediaName = interaction.options.getString("busca");
		const format = (interaction.options.getString("formato") ??
			"ANIME") as MediaType;

		if (!mediaName) return;

		const data = await this.container.anilistAPI.getMedia(mediaName, format);
		const channel = interaction.channel as TextChannel;

		if (data.isAdult && !channel.nsfw) {
			return interaction.reply({
				content:
					"Contéudo Adulto. Utilize comando novamente em um canal com restrição de idade!",
				ephemeral: false,
				fetchReply: false,
			});
		}

		const info = interaction.options.getString("info") ?? "resume";
		const embed =
			info === "resume"
				? this.createAnimeResumedEmbed(data)
				: this.createAnimeDetailedEmbed(data);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}

	private createAnimeResumedEmbed(data: Media) {
		const {
			title: { romaji },
			coverImage: { large },
			status,
			genres,
			episodes = 0,
			duration,
			siteUrl,
			description,
		} = data;

		const animeDescription = description.replace(/<.*?>/g, "");
		const fields: APIEmbedField[] = [];

		if (status) {
			fields.push({
				name: "Status",
				value: pascal(replaceUnderlines(status)),
				inline: true,
			});
		}

		if (duration) {
			fields.push({
				name: "Duration",
				value: `${duration} Minutes`,
				inline: true,
			});
		}

		if (episodes) {
			fields.push({
				name: "Episodes",
				value: String(episodes),
				inline: true,
			});
		}

		if (genres.length) {
			fields.push({
				name: "Genres",
				value: genres.join(", "),
				inline: false,
			});
		}

		return new EmbedBuilder()
			.setTitle(romaji)
			.setURL(siteUrl)
			.setThumbnail(large)
			.setDescription(animeDescription)
			.addFields(fields)
			.setColor(embedColors.anilist);
	}

	private createAnimeDetailedEmbed(data: Media) {
		const {
			coverImage: { large },
			title,
			status,
			format,
			genres,
			episodes = 0,
			duration,
			startDate,
			endDate,
			siteUrl,
			description,
			averageScore,
			meanScore,
			season,
			source,
			studios,
			isAdult,
		} = data;

		const animationStudios = studios.nodes.filter(
			(std) => std.isAnimationStudio,
		);

		const studiosNames = (
			animationStudios.length ? animationStudios : data.studios.nodes
		)
			.map((nd) => nd.name)
			.join("\n");

		const fields: APIEmbedField[] = [];
		const startDateFormated = startDate && formatDate(startDate);
		const endDateFormated = endDate && formatDate(endDate);
		const animeDescription = [description.replace(/<.*?>/g, "")];

		if (title.english) {
			animeDescription.unshift(title.english);
		}

		if (title.native) {
			animeDescription.unshift(title.native);
		}

		if (animeDescription.length > 1) {
			animeDescription.splice(animeDescription.length - 1, 0, "");
		}

		if (format) {
			fields.push({
				name: "Format",
				value: pascal(replaceUnderlines(format)),
				inline: true,
			});
		}

		if (status) {
			fields.push({
				name: "Status",
				value: pascal(replaceUnderlines(status)),
				inline: true,
			});
		}

		if (episodes) {
			fields.push({
				name: "Episodes",
				value: String(episodes),
				inline: true,
			});
		}

		if (source) {
			fields.push({
				name: "Source",
				value: pascal(source),
				inline: true,
			});
		}

		if (season) {
			fields.splice(6, 0, {
				name: "Season",
				value: pascal(season),
				inline: true,
			});
		}

		if (duration) {
			fields.push({
				name: "Duration",
				value: `${duration} Minutes`,
				inline: true,
			});
		}

		if (averageScore) {
			fields.push({
				name: "Average Score",
				value: `${averageScore ?? 0}%`,
				inline: true,
			});
		}

		if (meanScore) {
			fields.push({
				name: "Mean Score",
				value: `${meanScore ?? 0}%`,
				inline: true,
			});
		}

		if (studiosNames.length) {
			fields.push({
				name: "Studios",
				value: studiosNames,
				inline: true,
			});
		}

		if (startDateFormated.length) {
			fields.push({
				name: "Release Date",
				value: startDateFormated,
				inline: true,
			});
		}

		if (endDateFormated.length) {
			fields.push({
				name: "End Date",
				value: endDateFormated,
				inline: true,
			});
		}

		fields.push({
			name: "Adult",
			value: isAdult ? "Yes" : "No",
			inline: true,
		});

		if (genres.length) {
			fields.push({
				name: "Genres",
				value: genres.join(", "),
				inline: false,
			});
		}

		return new EmbedBuilder()
			.setTitle(title.romaji)
			.setURL(siteUrl)
			.setThumbnail(large)
			.setDescription(animeDescription.join("\n"))
			.addFields(fields)
			.setColor(embedColors.anilist);
	}
}
