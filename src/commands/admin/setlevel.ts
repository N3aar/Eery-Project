import { adminPermission } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class SetLevelCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("setlevel")
				.setDescription("Definir o level de outro usuário")
				.setDefaultMemberPermissions(adminPermission)
				.addUserOption((option) => {
					option.setName("usuario");
					option.setDescription("Usuário que receberá o nível");
					option.setRequired(true);
					return option;
				})
				.addNumberOption((option) => {
					option.setName("level");
					option.setDescription("Nivel que o usuário irá receber");
					option.setMinValue(1);
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser("usuario");
		const level = interaction.options.getNumber("level");

		if (!user || !level) return;

		await this.container.db.user.upsert({
			where: {
				discordId: user.id,
			},
			update: {
				level,
				xp: 0,
			},
			create: {
				discordId: user.id,
				level,
			},
		});

		this.container.expHandler.deleteMemberFromCache(user.id);

		await interaction.reply({
			content: "Nivel do usuário definido com sucesso!",
			flags: ["Ephemeral"],
			fetchReply: false,
		});
	}
}
