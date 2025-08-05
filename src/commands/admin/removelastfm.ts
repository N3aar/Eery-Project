import { adminPermission } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export class RemoveLastFmCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("removelastfm")
				.setDescription("Desvincular um usuário de uma conta do LastFM")
				.setDefaultMemberPermissions(adminPermission)
				.addStringOption((option) => {
					option.setName("username");
					option.setDescription("Username da conta a ser desvinculada");
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

		const jumbleData = await this.container.db.jumble.findFirst({
			where: { lastfmUser: username },
			select: { id: true },
		});

		if (!jumbleData) {
			await interaction.reply({
				content:
					"Username não encontrado, não há ninguém vinculado a esta conta!",
				flags: ["Ephemeral"],
				withResponse: false,
			});

			return;
		}

		await this.container.db.jumble.update({
			where: { id: jumbleData.id },
			data: {
				lastfmUser: null,
			},
		});

		await interaction.reply({
			content: "Username removido com sucesso!",
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
