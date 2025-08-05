import { eventTypes } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export class BirthdayCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("birthday")
				.setDescription("Definir a data do seu aniversário")
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
		const member = interaction.member as GuildMember;
		const day = interaction.options.getNumber("dia");
		const month = interaction.options.getNumber("mes");

		if (!guild || !member || !day || !month) return;

		const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);

		await this.container.db.$transaction(async (prisma) => {
			const guildData = await prisma.guild.findUnique({
				where: {
					discordId: guild.id,
				},
				select: {
					id: true,
				},
			});

			if (!guildData) throw new Error("Guild not found");

			await prisma.user.upsert({
				where: {
					discordId: member.id,
				},
				update: {
					birthday: birthdayDate,
				},
				create: {
					discordId: member.id,
					birthday: birthdayDate,
				},
			});

			const eventData = await prisma.events.findFirst({
				where: {
					type: eventTypes.BIRTHDAY,
					createdBy: member.id,
				},
				select: {
					id: true,
				},
			});

			if (eventData?.id) {
				await prisma.events.update({
					where: { id: eventData.id },
					data: { day, month },
				});
			} else {
				await prisma.events.create({
					data: {
						description: "",
						day: day,
						month: month,
						repeat: true,
						type: eventTypes.BIRTHDAY,
						createdBy: member.id,
						guildId: guildData.id,
					},
				});
			}
		});

		await interaction.reply({
			content: "Aniversário definido com sucesso!",
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
