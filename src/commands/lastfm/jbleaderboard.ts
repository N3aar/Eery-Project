import type { JumbleField } from "@/shared/handlers/JumbleGameHandler.js";
import {
	embedColors,
	fieldTitles,
	fieldValues,
	leaderboardEmojis,
	leaderboardIcon,
} from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class JBLeaderboardCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("jbleaderboard")
				.setDescription("Mostrar o ranking de vitórias no Jumble")
				.addStringOption((option) => {
					option.setName("tipo");
					option.setDescription("quantas posições mostrar");
					option.setRequired(false);
					option.addChoices([
						{
							name: "Vitórias",
							value: "points",
						},
						{
							name: "Melhor Tempo",
							value: "bestTime",
						},
						{
							name: "Jogadas",
							value: "plays",
						},
					]);
					return option;
				})
				.addNumberOption((option) => {
					option.setName("quantidade");
					option.setDescription("quantas posições mostrar");
					option.setRequired(false);
					option.setMaxValue(25);
					option.setMinValue(1);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;

		if (!guild) return;

		const type = (interaction.options.getString("tipo") ??
			"points") as JumbleField;
		const quantity = interaction.options.getNumber("quantidade") ?? 10;
		const leaderboard = await this.container.jumbleGameHandler.getLeaderboard(
			type,
			quantity,
		);

		const fieldTitle = fieldTitles[type];
		const fieldValue = fieldValues[type];

		const values = leaderboard.map((stats) => `${stats[type]} ${fieldValue}`);
		const users = leaderboard.map((stats, index) => {
			return `${leaderboardEmojis[index] ?? `${index + 1}.`} <@${
				stats.user.discordId
			}>`;
		});

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Top ${users.length} ${fieldTitle}`,
				iconURL: leaderboardIcon,
			})
			.setColor(embedColors.default)
			.addFields([
				{
					name: "Usuário",
					value: users.join("\n"),
					inline: true,
				},
				{
					name: fieldTitle,
					value: values.join("\n"),
					inline: true,
				},
			]);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
