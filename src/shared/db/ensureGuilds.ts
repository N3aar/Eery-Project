import { container } from "@sapphire/pieces";
import type { Collection, Guild } from "discord.js";

export async function ensureGuilds(guilds: Collection<string, Guild>) {
	const guildInserts = guilds.map((guild) => ensureGuild(guild));
	return container.db.$transaction(guildInserts);
}

export function ensureGuild(guild: Guild) {
	return container.db.guild.upsert({
		where: {
			discordId: guild.id,
		},
		update: {},
		create: {
			discordId: guild.id,
			daily: {
				create: {},
			},
		},
	});
}
