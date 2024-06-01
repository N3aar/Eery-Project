import { EmbedColors } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, type ImageURLOptions } from "discord.js";

export class GuildIconCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName("icon").setDescription("Mostrar o icon do Servidor"),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;
		if (!guild) return;

		const config: ImageURLOptions = {
			extension: "png",
			size: 4096,
			forceStatic: false,
		};

		const guildIcon = guild?.iconURL(config);
		const embed = new EmbedBuilder()
			.setTitle(guild.name)
			.setImage(guildIcon)
			.setColor(EmbedColors.default);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}
}
