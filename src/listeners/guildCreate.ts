import { ensureGuild } from "@/shared/db/ensureGuilds.js";
import { Listener } from "@sapphire/framework";
import type { Guild } from "discord.js";

export class MessageCreate extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: "guildCreate",
		});
	}

	public async run(guild: Guild) {
		await ensureGuild(guild);
	}
}
