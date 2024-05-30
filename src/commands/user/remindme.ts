import { Command } from "@sapphire/framework";
import type { GuildMember, TextChannel } from "discord.js";

export class RemindMeCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("remindme")
				.setDescription("Lembrar você após o tempo definido")
				.addNumberOption((option) => {
					option.setName("minutes");
					option.setDescription("Tempo em minutos");
					option.setMaxValue(60);
					option.setMinValue(1);
					option.setRequired(false);
					return option;
				})
        .addStringOption((option) => {
					option.setName("message");
					option.setDescription("Mensagem do lembrete");
					option.setMaxLength(200);
					option.setRequired(false);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member = interaction.member as GuildMember;
		if (!member || !interaction.channel) return;

    const time = interaction.options.getNumber("minutes") || 15;
    const message = interaction.options.getString("message") || "";

    const minutes = Math.max(Math.min(time, 60), 1);
    const ms = minutes * 60000;

    const channel = interaction.channel as TextChannel;
    const memberId = member.id;

    setTimeout(() => channel.send(`<@${memberId}>, Lembrete: \`${message}\`!`), ms);

		await interaction.reply({
			content: `Irei te lembrar em \`${minutes}\` Minuto${minutes > 1 ? 's' : ''}!`,
			ephemeral: false,
			fetchReply: false,
		});
	}
}
