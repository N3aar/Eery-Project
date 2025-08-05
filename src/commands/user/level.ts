import { Command } from "@sapphire/framework";
import {
	EmbedBuilder,
	type GuildMember,
	type ImageURLOptions,
} from "discord.js";

export class LevelCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("level")
				.setDescription("Mostrar o nivel atual do usuário")
				.addUserOption((option) => {
					option.setName("user");
					option.setDescription("Usuário que deseja ver o nivel");
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

		const stats = await this.container.expHandler.getStats(member, guild);
		const progress = this.container.expHandler.progressBar(
			stats.exp,
			stats.level,
			15,
		);

		const icon = member.displayAvatarURL(config);
		const embed = new EmbedBuilder()
			.setAuthor({ name: nickname, iconURL: icon })
			.setDescription(`***Nivel ${stats.level}***\n**${progress}**`)
			.setColor(color);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
