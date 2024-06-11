import { container } from "@sapphire/pieces";
import type { Guild } from "discord.js";

export async function ensureGuilds(guilds: Guild[]) {
	await Promise.all(guilds.map((guild) => ensureGuild(guild)));
}

export async function ensureGuild(guild: Guild) {
	return container.db.guild.upsert({
		where: {
			discordId: guild.id,
		},
		update: {},
		create: {
			discordId: guild.id,
		},
	});
}
