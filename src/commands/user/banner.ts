import { Command } from "@sapphire/framework";
import { EmbedBuilder, type GuildMember } from "discord.js";

export class BannerCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("banner")
				.setDescription("Mostrar o banner que usuário estiver usando")
				.addUserOption((option) => {
					option.setName("user");
					option.setDescription("Usuário que deseja ver o banner");
					option.setRequired(false);
					return option;
				}),
		);
	}

	public createBannerURL(userId: string, bannerHash: string) {
		const format = bannerHash.startsWith("a_") ? "gif" : "png";
		return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${format}?size=4096`;
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member =
			interaction.guild?.members.cache.get(
				interaction.options.getUser("user")?.id ?? "",
			) ?? (interaction.member as GuildMember);

		if (!member) return;

		const nickname = member.displayName;
		const color = member.displayColor;
		const user = await this.container.discordAPI.getUser(member.id);

		const bannerHash = user.banner;

		if (!bannerHash) {
			return interaction.reply({
				content: "Usuário não possui um banner!",
				flags: ["Ephemeral"],
				withResponse: false,
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(nickname)
			.setImage(this.createBannerURL(member.id, bannerHash))
			.setColor(color);

		await interaction.reply({
			embeds: [embed],
			flags: ["Ephemeral"],
			withResponse: false,
		});
	}
}
