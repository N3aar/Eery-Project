import { regexUrl, regexUrlParams, urlFixers } from "@/utils/contants.js";
import { getOrCreateWebhook } from "@/utils/webhook.js";
import { container } from "@sapphire/pieces";
import type { Message, TextChannel } from "discord.js";
import { DiscordAPIError } from "discord.js";

const MAX_RETRY = 3;

export default async function urlHelper(message: Message, retry = 0) {
	if (retry > MAX_RETRY) {
		console.error("Max retries reached for URL Helper.");
		return;
	}

	const content = message.content;
	const channelWebhooks = container.webhookCache;
	const urls = content.match(regexUrl);
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
				newUrl = newUrl.replace(site, replacement).replace(regexUrlParams, "");
			}
		}
		return newUrl;
	});

	try {
		const webhook = await getOrCreateWebhook(message.channel as TextChannel);

		await webhook.send({
			content: message.content.replace(regexUrl, () => fixedUrls.shift() || ""),
			username: message.member?.displayName ?? message.author.displayName,
			avatarURL: message.author.displayAvatarURL({
				forceStatic: false,
				size: 128,
			}),
			allowedMentions: { repliedUser: false },
		});

		await message.delete();
	} catch (error) {
		if (error instanceof DiscordAPIError && error.code === 10015) {
			// Retry
			channelWebhooks.delete(message.channel.id);
			return urlHelper(message, retry + 1);
		}

		console.error("Error in URL Helper:", error);
		channelWebhooks.delete(message.channel.id);
	}
}
