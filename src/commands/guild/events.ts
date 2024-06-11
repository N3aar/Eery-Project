import { embedColors, eventTypes } from "@/utils/contants.js";
import { pad } from "@/utils/stringFormat.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export class EventsCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("events")
				.setDescription("Ver os eventos agendados")
				.addNumberOption((option) => {
					option.setName("pagina");
					option.setDescription("Página da lista de Eventos");
					option.setMinValue(1);
					option.setRequired(false);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guild = interaction.guild;

		if (!guild) return;

		const page = interaction.options.getNumber("pagina") || 1;

		const events = await this.container.db.events.findMany({
			take: 10,
			skip: (page - 1) * 10,
			orderBy: [{ month: "asc" }, { day: "asc" }],
			where: {
				guild: {
					discordId: guild.id,
				},
				type: eventTypes.default,
			},
			include: {
				user: true,
			},
		});

		if (events.length <= 0) {
			await interaction.reply({
				content: "Não há eventos agendados nesta página!",
				ephemeral: false,
				fetchReply: false,
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle("Eventos")
			.setDescription(
				events
					.map(
						(event) =>
							`**${pad(event.day)}/${pad(event.month)} - ${
								event.description
							}**\npor <@${event.user?.discordId}>`,
					)
					.join("\n\n"),
			)
			.setColor(embedColors.default);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}
}
