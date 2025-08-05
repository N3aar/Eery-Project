import { embedColors, eventTypes } from "@/utils/contants.js";
import { pad } from "@/utils/stringFormat.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, type GuildMember } from "discord.js";

export class BirthdayCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("birthdays")
				.setDescription("Ver todos os aniversários")
				.addNumberOption((option) => {
					option.setName("mes");
					option.setDescription("Mês do Evento");
					option.setMinValue(1);
					option.setMaxValue(12);
					option.setRequired(false);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;

		if (!guild || !member) return;

		const month = interaction.options.getNumber("mes");
		const birthdays = await this.container.db.events.findMany({
			orderBy: [{ month: "asc" }, { day: "asc" }],
			where: {
				guild: {
					discordId: guild.id,
				},
				type: eventTypes.BIRTHDAY,
				month: month ?? undefined,
			},
			include: {
				user: true,
			},
		});

		if (!birthdays || birthdays.length <= 0) {
			await interaction.reply({
				content: "Não há aniversários neste mês!",
				flags: ["Ephemeral"],
				withResponse: false,
			});
			return;
		}

		const monthStatus = month ? `Mês ${pad(month)}` : "";
		const birthdayList = birthdays.map(
			(event) =>
				`:tada: <@${event.createdBy}>: **${pad(event.day)}/${pad(
					event.month,
				)}**`,
		);

		const embed = new EmbedBuilder()
			.setTitle(`Aniversários ${monthStatus}`)
			.setDescription(birthdayList.join("\n"))
			.setColor(embedColors.default);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
