import { Command } from "@sapphire/framework";
import {
	EmbedBuilder,
	type GuildMember,
	type ImageURLOptions,
} from "discord.js";

export class AvatarCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("avatar")
				.setDescription("Mostrar o avatar que usuário estiver usando")
				.addStringOption((option) => {
					option.setName("type");
					option.setDescription("Origem do avatar");
					option.setRequired(false);
					option.addChoices([
						{
							name: "Servidor",
							value: "guild",
						},
						{
							name: "Usuário",
							value: "user",
						},
					]);
					return option;
				})
				.addUserOption((option) => {
					option.setName("user");
					option.setDescription("Usuário que deseja ver o avatar");
					option.setRequired(false);
					return option;
				}),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member =
			interaction.guild?.members.cache.get(
				interaction.options.getUser("user")?.id ?? "",
			) ?? (interaction.member as GuildMember);

		if (!member) return;

		const nickname = member.displayName;
		const color = member.displayColor;

		const config: ImageURLOptions = {
			extension: "png",
			size: 4096,
			forceStatic: false,
		};

		const userType = interaction.options.getString("type");
		const avatarType =
			userType === "user" || !member.avatar ? "Usuário" : "Servidor";
		const avatar =
			userType === "user"
				? member.user.displayAvatarURL(config)
				: member.displayAvatarURL(config);

		const embed = new EmbedBuilder()
			.setTitle(nickname)
			.setImage(avatar)
			.setFooter({ text: avatarType })
			.setColor(color);

		await interaction.reply({
			embeds: [embed],
			ephemeral: false,
			fetchReply: false,
		});
	}
}
