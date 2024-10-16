import { adminPermission, eventTypes } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class RemoveBirthdayCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("removebirthday")
				.setDescription("Remover o aniversário de outro usuário")
				.setDefaultMemberPermissions(adminPermission)
				.addStringOption((option) => {
					option.setName("usuario");
					option.setDescription("Usuário aniversariante");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const userId = interaction.options.getString("usuario");

		if (!userId) return;

		await this.container.db.events.deleteMany({
			where: {
				type: eventTypes.BIRTHDAY,
				createdBy: userId,
			},
		});

		await interaction.reply({
			content: "Aniversário removido com sucesso!",
			ephemeral: true,
			fetchReply: false,
		});
	}
}
