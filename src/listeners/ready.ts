import startTimers from "@/events/startTimers.js";
import { ensureGuilds } from "@/shared/db/ensureGuilds.js";
import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";

export class ReadyListener extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			once: true,
			event: "ready",
		});
	}

	public run(client: Client) {
		ensureGuilds(client.guilds.cache);
		startTimers();
	}
}
