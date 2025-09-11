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

	const replacedContent = urls.reduce((acc, url) => {
		for (const [site, fix] of fixes) {
			if (url.includes(site)) {
				const newUrl = url.replace(site, fix).replace(regexUrlParams, "");
				return acc.replace(url, newUrl);
			}
		}
		return acc;
	}, content);

	if (replacedContent === content) return;

	try {
		const webhook = await getOrCreateWebhook(message.channel as TextChannel);

		await webhook.send({
			content: replacedContent,
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
