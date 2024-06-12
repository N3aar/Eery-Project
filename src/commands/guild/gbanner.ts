import { embedColors } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, type ImageURLOptions } from "discord.js";

export class GuildBannerCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName("gbanner").setDescription("Mostrar o banner do Servidor"),
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

		const guildIcon = guild?.bannerURL(config);

		if (!guildIcon) {
			return interaction.reply({
				content: "Servidor não possui um Banner!",
				ephemeral: false,
				fetchReply: false,
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(guild.name)
			.setImage(guildIcon)
			.setColor(embedColors.default);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}
}
