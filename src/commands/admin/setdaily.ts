import { adminPermission } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class SetDailyCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("setdaily")
				.setDescription("Definir se o envio de imagens diárias está ativado")
				.setDefaultMemberPermissions(adminPermission)
				.addBooleanOption((option) => {
					option.setName("habilitar");
					option.setDescription("Habilitar ou desabilitar o envio diário");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;
		const enabled = interaction.options.getBoolean("habilitar");

		if (!guild || typeof enabled !== "boolean") return;

		await this.container.db.guild.update({
			where: {
				discordId: guild.id,
			},
			data: {
				dailyEnabled: enabled as boolean,
			},
		});

		await interaction.reply({
			content: "Configuração atualizada com sucesso!",
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
