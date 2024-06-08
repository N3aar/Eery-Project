import { urlFixers } from "@/utils/contants.js";
import type { Message } from "discord.js";

export default async function urlHelper(message: Message) {
	const content = message.content;
	const regex = /(https?:\/\/[^\s]+)/g;
	const urls = content.match(regex);
	const fixes = Object.entries(urlFixers);

	if (
		!urls ||
		!urls.length ||
		urls.every((url) => fixes.every(([site]) => !url.includes(site)))
	)
		return;

	const fixedUrls = urls.map((url) => {
		let newUrl = url;
		for (const [site, replacement] of fixes) {
			if (newUrl.includes(site)) {
				newUrl = newUrl.replace(site, replacement);
			}
		}
		return newUrl;
	});

	message.suppressEmbeds(true);
	message.reply({
		content: fixedUrls.join("\n"),
		allowedMentions: { repliedUser: false },
	});
}
