import { adminPermission } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class ChannelCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("channel")
				.setDescription("Definir o canal principal do Servidor")
				.setDefaultMemberPermissions(adminPermission)
				.addChannelOption((option) => {
					option.setName("canal");
					option.setDescription("Canal a ser definido");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;
		const channel = interaction.options.getChannel("canal");

		if (!guild || !channel) return;

		await this.container.db.guild.update({
			where: {
				discordId: guild.id,
			},
			data: {
				mainChannel: channel.id,
			},
		});

		await interaction.reply({
			content: "Canal definido com sucesso!",
			ephemeral: true,
			fetchReply: false,
		});
	}
}
