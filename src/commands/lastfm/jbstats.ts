import { Command } from "@sapphire/framework";
import {
	EmbedBuilder,
	type GuildMember,
	type ImageURLOptions,
} from "discord.js";

export class JBStatsCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("jbstats")
				.setDescription("Mostrar estatísticas do jogo Jumble")
				.addUserOption((option) => {
					option.setName("user");
					option.setDescription("Usuário que deseja ver as estatísticas");
					option.setRequired(false);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;

		if (!guild) return;

		const member =
			guild?.members.cache.get(interaction.options.getUser("user")?.id ?? "") ??
			(interaction.member as GuildMember);

		if (!member) return;

		const nickname = member.displayName;
		const color = member.displayColor;
		const config: ImageURLOptions = {
			extension: "png",
			size: 4096,
			forceStatic: false,
		};

		const stats = await this.container.jumbleGameHandler.getUserStats(
			member.id,
		);

		if (!stats) {
			const embed = new EmbedBuilder()
				.setDescription(
					"Jogue Jumble usando o comando /jumble, para criar suas estatísticas.",
				)
				.setColor(color);

			await interaction.reply({
				embeds: [embed],
				ephemeral: false,
				fetchReply: false,
			});

			return;
		}

		const icon = member.displayAvatarURL(config);
		const fields = [
			{
				name: "Jogadas",
				value: `**${stats.plays}** vezes`,
				inline: true,
			},
			{
				name: "Vitórias",
				value: `**${stats.points}** Pontos`,
				inline: true,
			},
			{
				name: "Melhor Tempo",
				value: `**${stats.bestTime}** segundos`,
				inline: true,
			},
		];

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${nickname} - Jumble`, iconURL: icon })
			.addFields(fields)
			.setColor(color);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}
}
