import {
	EmbedColors,
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
				.setDescription("Mostrar o ranking de nivel dos usuários"),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;

		if (!guild) return;

		const leaderboard = await this.container.expHandler.getLeaderboard();
		const levels = leaderboard.map((user) => `Nível ${user.level}`);
		const users = leaderboard.map((user, index) => {
			const nickname =
				guild.members.cache.get(user.discordId)?.displayName ??
				"Não Encontrado";

			return `${leaderboardEmojis[index] ?? `${index + 1}.`} ${nickname}`;
		});

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Top ${users.length} Níveis`,
				iconURL: leaderboardIcon,
			})
			.setColor(EmbedColors.default)
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
			ephemeral: false,
			fetchReply: false,
		});
	}
}
