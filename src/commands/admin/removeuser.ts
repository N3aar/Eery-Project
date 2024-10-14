import { adminPermission, eventTypes } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class RemoveUserCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("removeuser")
				.setDescription("Deletar os dados de outro usuário")
				.setDefaultMemberPermissions(adminPermission)
				.addUserOption((option) => {
					option.setName("usuario");
					option.setDescription("Usuário a ser deletado");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser("usuario");

		if (!user) return;

		await this.container.db.user.deleteMany({
			where: {
				discordId: user.id,
			},
		});

		await interaction.reply({
			content: "Usuário removido com sucesso!",
			ephemeral: true,
			fetchReply: false,
		});
	}
}
