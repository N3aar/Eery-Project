import { regexHex } from "@/utils/contants.js";
import { Command } from "@sapphire/framework";
import type {
	Collection,
	Guild,
	GuildMemberRoleManager,
	Role,
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
					option.setName("primary_color");
					option.setDescription("Cor primária em hexadecimal");
					option.setMaxLength(7);
					option.setMinLength(6);
					option.setRequired(true);
					return option;
				})
				.addStringOption((option) => {
					option.setName("secondary_color");
					option.setDescription("Cor secundária em hexadecimal");
					option.setMaxLength(7);
					option.setMinLength(6);
					option.setRequired(false);
					return option;
				}),
		);
	}

	public isHexColor(color: string) {
		return regexHex.test(color);
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

	public removeHash(text: string) {
		return text.replaceAll("#", "");
	}

	public findRoleWithColor(
		roles: Collection<string, Role>,
		colorOne: string,
		colorTwo?: string | null,
	) {
		return roles.find((role) => {
			const name = role.name;
			const matches = name.match(regexHex);

			if (!matches?.length) return false;

			const [colorRoleOne, colorRoleTwo] = matches;
			const matchColorOne = colorRoleOne === colorOne;
			const matchColorTwo =
				colorTwo && colorRoleTwo ? colorRoleTwo === colorTwo : true;

			return matchColorOne && matchColorTwo;
		});
	}

	public hasCurrentColor(
		roles: Collection<string, Role>,
		colorOne: string,
		colorTwo?: string | null,
	) {
		return !!this.findRoleWithColor(roles, colorOne, colorTwo);
	}

	public patternColor(colorOne: string, colorTwo: string) {
		return `[ ${colorOne} | ${colorTwo} ]`;
	}

	public async createNewRoleWithColor(
		guild: Guild,
		name: string,
		decimalColorPrimary: number,
		decimalColorSecondary: number | null,
	) {
		return await this.container.discordAPI.createRole(guild.id, {
			name,
			color: decimalColorPrimary,
			colors: {
				primary_color: decimalColorPrimary,
				secondary_color: decimalColorSecondary,
				tertiary_color: null,
			},
			hoist: false,
			mentionable: false,
			permissions: "0",
		});
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const member = interaction.member;
		if (!member) return;

		const colorPrimary = interaction.options.getString("primary_color");
		const colorSecondary = interaction.options.getString("secondary_color");

		if (!colorPrimary || !this.isHexColor(colorPrimary)) {
			return interaction.reply({
				content: "Digite uma cor válida!",
				ephemeral: false,
				fetchReply: false,
			});
		}

		const roles = member?.roles as GuildMemberRoleManager;
		if (this.hasCurrentColor(roles.cache, colorPrimary, colorSecondary)) {
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
		if (!guild || !colorPrimary) return;

		const existentRole =
			guild.roles &&
			this.findRoleWithColor(guild.roles.cache, colorPrimary, colorSecondary);

		const name = colorPrimary;
		const decimalColorPrimary = Number.parseInt(
			colorPrimary.replace("#", ""),
			16,
		);
		const decimalColorSecondary = colorSecondary
			? Number.parseInt(colorSecondary.replace("#", ""), 16)
			: null;
		const newRole =
			existentRole ??
			(await this.createNewRoleWithColor(
				guild,
				name,
				decimalColorPrimary,
				decimalColorSecondary,
			));

		roles.add(newRole.id);

		await interaction.reply({
			content: "Cor definida com sucesso!",
			ephemeral: false,
			fetchReply: false,
		});
	}
}
