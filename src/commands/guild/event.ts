import { eventTypes } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export class EventCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("event")
				.setDescription("Definir um evento agendado")
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
					option.setDescription("Mês do Evento");
					option.setMinValue(1);
					option.setMaxValue(12);
					option.setRequired(true);
					return option;
				})
				.addStringOption((option) => {
					option.setName("mensagem");
					option.setDescription("Mensagem de anúncio do Evento");
					option.setRequired(true);
					return option;
				})
				.addBooleanOption((option) => {
					option.setName("repetir");
					option.setDescription("Se o evento deve se repetir sempe");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;

		if (!guild || !member) return;

		const guildData = await this.container.db.guild.findUnique({
			where: {
				discordId: guild.id,
			},
			select: {
				id: true,
			},
		});

		if (!guildData) return;

		const day = interaction.options.getNumber("dia");
		const month = interaction.options.getNumber("mes");
		const message = interaction.options.getString("mensagem");
		const repeat = interaction.options.getBoolean("repetir");

		if (!day || !month || !message || repeat === null) return;

		await this.container.db.events.create({
			data: {
				description: message,
				day: day,
				month: month,
				repeat: repeat,
				type: eventTypes.DEFAULT,
				createdBy: member.id,
				guildId: guildData.id,
			},
		});

		await interaction.reply({
			content: "Evento agendado com sucesso!",
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
