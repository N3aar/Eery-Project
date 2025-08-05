import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";

export class PingCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder.setName("ping").setDescription("Verifica se o bot está online"),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const response = await interaction.reply({
			content: "Pinging...",
			flags: ["Ephemeral"],
			withResponse: true,
		});

		if (!response) return;

		const interactionReply = response.interaction;

		if (interactionReply) {
			const createdTimestamp = interactionReply.createdTimestamp;
			const diff = createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(
				`Pong 🏓!\nDifereça: \`${diff}\`. API: \`${ping}\``,
			);
		}

		return interaction.editReply("Failed to retrieve ping :(");
	}
}
