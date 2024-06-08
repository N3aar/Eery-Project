import { urlFixers } from "@/utils/contants.js";
import type { Message } from "discord.js";

export default async function suppressUrlEmbeds(message: Message) {
	const content = message.content;

	if (message.embeds.length <= 0) return;

	for (const url in urlFixers) {
		if (content.includes(url)) {
			message.suppressEmbeds(true);
			return;
		}
	}
}
