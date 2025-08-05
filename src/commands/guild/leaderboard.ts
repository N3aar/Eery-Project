import {
	embedColors,
	leaderboardEmojis,
	leaderboardIcon,
} from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class LeaderboardCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("leaderboard")
				.setDescription("Mostrar o ranking de nivel dos usuários")
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

		const quantity = interaction.options.getNumber("quantidade") ?? 10;
		const leaderboard =
			await this.container.expHandler.getLeaderboard(quantity);

		const levels = leaderboard.map((user) => String(user.level));
		const users = leaderboard.map((user, index) => {
			return `${leaderboardEmojis[index] ?? `${index + 1}.`} <@${
				user.discordId
			}>`;
		});

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Top ${users.length} Níveis`,
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
					name: "Nível",
					value: levels.join("\n"),
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
