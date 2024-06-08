import suppressUrlEmbeds from "@/events/supressUrlEmbeds.js";
import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

export class MessageUpdate extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: "messageUpdate",
		});
	}

	public run(oldMessage: Message, newMessage: Message) {
		if (newMessage.author.bot) return;
		suppressUrlEmbeds(newMessage);
	}
}
