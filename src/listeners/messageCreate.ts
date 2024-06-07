import emojiHelper from "@/events/emojiHelper.js";
import giveXp from "@/events/giveXp.js";
import urlHelper from "@/events/urlHelper.js";
import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

export class MessageCreate extends Listener {
	public constructor(
		context: Listener.LoaderContext,
		options: Listener.Options,
	) {
		super(context, {
			...options,
			event: "messageCreate",
		});
	}

	public run(message: Message) {
		if (message.author.bot) return;

		urlHelper(message);
		emojiHelper(message);
		giveXp(message);
	}
}
