import { Command } from "@sapphire/framework";
import type {
	GuildMemberRoleManager,
	Role,
	Guild,
	Collection,
} from "discord.js";

export class ColorCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName("color")
				.setDescription("Trocar a cor do seu cargo")
				.addStringOption((option) => {
					option.setName("color");
					option.setDescription("Cor em hexadecimal");
					option.setMaxLength(7);
					option.setMinLength(6);
					option.setRequired(true);
					return option;
				}),
		);
	}

	public isHexColor(color: string) {
		const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		return hexPattern.test(color);
	}

	public findCurrentColorRoles(roles: IterableIterator<Role>) {
		const rolesWithColor = [];

		for (const role of roles) {
			if (this.isHexColor(role.name)) {
				rolesWithColor.push(role);
			}
		}

		return rolesWithColor;
	}

	public findRoleWithColor(roles: Collection<string, Role>, color: string) {
		return roles.find((role) => role.name === color);
	}

	public hasCurrentColor(roles: Collection<string, Role>, color: string) {
		return roles.some((role) => role.name === color);
	}

	public createNewRoleWithColor(
		guild: Guild,
		color: string,
		decimalColor: number,
	) {
		return guild.roles.create({
			name: color,
			color: decimalColor,
			mentionable: false,
			permissions: BigInt(0),
		});
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member = interaction.member;
		if (!member) return;

		const color = interaction.options.getString("color");
		const hex = color?.startsWith("#") ? color : `#${color}`;

		if (!this.isHexColor(hex)) {
			return interaction.reply({
				content: "Digite uma cor válida!",
				ephemeral: false,
				fetchReply: false,
			});
		}

		const roles = member?.roles as GuildMemberRoleManager;
		if (this.hasCurrentColor(roles.cache, hex)) {
			return interaction.reply({
				content: "Você já possui esta cor!",
				ephemeral: false,
				fetchReply: false,
			});
		}

		const currentColorRoles =
			roles && roles?.cache.size >= 1
				? this.findCurrentColorRoles(roles.cache.values())
				: [];

		for (const role of currentColorRoles) {
			roles.remove(role.id);
		}

		const guild = interaction.guild;
		if (!guild || !color) return;

		const existentRole =
			guild.roles && this.findRoleWithColor(guild.roles.cache, color);

		const decimalColor = Number.parseInt(color.replace("#", ""), 16);
		const newRole =
			existentRole ??
			(await this.createNewRoleWithColor(guild, hex, decimalColor));

		roles.add(newRole);

		await interaction.reply({
			content: "Cor definida com sucesso!",
			ephemeral: false,
			fetchReply: false,
		});
	}
}
