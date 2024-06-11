import { adminPermission, eventTypes } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";

export class SetBirthdayCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("setbirthday")
				.setDescription("Definir o aniversário de outro usuário")
				.setDefaultMemberPermissions(adminPermission)
				.addUserOption((option) => {
					option.setName("usuario");
					option.setDescription("Usuário aniversariante");
					option.setRequired(true);
					return option;
				})
				.addNumberOption((option) => {
					option.setName("dia");
					option.setDescription("Dia do Mês");
					option.setMinValue(1);
					option.setMaxValue(31);
					option.setRequired(true);
					return option;
				})
				.addNumberOption((option) => {
					option.setName("mes");
					option.setDescription("Mês do Aniversário");
					option.setMinValue(1);
					option.setMaxValue(12);
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;

		if (!guild) return;

		const guildData = await this.container.db.guild.findUnique({
			where: {
				discordId: guild.id,
			},
			select: {
				id: true,
			},
		});

		if (!guildData) return;

		const user = interaction.options.getUser("usuario");
		const day = interaction.options.getNumber("dia");
		const month = interaction.options.getNumber("mes");

		if (!user || !day || !month) return;

		const birthdayDate = new Date(new Date().getFullYear(), month, day);

		await this.container.db.user.upsert({
			where: {
				discordId: user.id,
			},
			update: {
				birthday: birthdayDate,
			},
			create: {
				discordId: user.id,
				birthday: birthdayDate,
			},
		});

		const eventData = await this.container.db.events.findFirst({
			where: {
				type: eventTypes.birthday,
				createdBy: user.id,
			},
			select: {
				id: true,
			},
		});

		if (eventData?.id) {
			await this.container.db.events.update({
				where: { id: eventData.id },
				data: { day, month },
			});
		} else {
			await this.container.db.events.create({
				data: {
					description: "",
					day: day,
					month: month,
					repeat: true,
					type: eventTypes.birthday,
					createdBy: user.id,
					guildId: guildData.id,
				},
			});
		}

		await interaction.reply({
			content: "Aniversário definido com sucesso!",
			ephemeral: true,
			fetchReply: false,
		});
	}
}
