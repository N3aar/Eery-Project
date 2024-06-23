import { embedColors } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import { EmbedBuilder, type GuildMember } from "discord.js";

export class LastFmCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("lastfm")
				.setDescription("Definir seu usuário do Last FM")
				.addStringOption((option) => {
					option.setName("username");
					option.setDescription("Username da sua conta");
					option.setRequired(true);
					return option;
				}),
		);
	}

	public async chatInputRun(
		interaction: Command.ChatInputCommandInteraction,
	): Promise<void> {
		const member = interaction.member as GuildMember;
		const username = interaction.options.getString("username");

		if (!member || !username) {
			return;
		}

		const check = await this.container.db.jumble.findFirst({
			where: { lastfmUser: username },
			select: { user: true },
		});

		if (check?.user) {
			const embed = new EmbedBuilder()
				.setDescription(
					`Esta conta já foi registrada por <@${check.user.discordId}>!`,
				)
				.setColor(embedColors.default);

			await interaction.reply({
				embeds: [embed],
				ephemeral: false,
				fetchReply: false,
			});

			return;
		}

		await this.container.db.$transaction(async (prisma) => {
			const userData = await prisma.user.findUnique({
				where: { discordId: member.id },
				select: { id: true },
			});

			if (!userData) {
				throw new Error("User not found");
			}

			await prisma.jumble.upsert({
				where: { userId: userData.id },
				update: { lastfmUser: username },
				create: {
					userId: userData.id,
					lastfmUser: username,
				},
			});
		});

		await interaction.reply({
			content: "Conta registrada com sucesso!",
			ephemeral: false,
			fetchReply: false,
		});
	}
}
