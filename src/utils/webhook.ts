import { container } from "@sapphire/pieces";
import type { TextChannel, Webhook } from "discord.js";

const WEBHOOK_NAME = "Eery URL fix";

export async function getOrCreateWebhook(
	channel: TextChannel,
): Promise<Webhook> {
	const channelId = channel.id;
	const channelWebhooks = container.webhookCache;

	const webhook = channelWebhooks.get(channelId);

	if (webhook) {
		return webhook;
	}

	const existingWebhooks = await channel.fetchWebhooks();
	const existingWebhook = existingWebhooks.find(
		(wh) => wh.name === WEBHOOK_NAME,
	);

	if (existingWebhook) {
		channelWebhooks.set(channelId, existingWebhook);
		return existingWebhook;
	}

	const newWebhook = await channel.createWebhook({
		name: WEBHOOK_NAME,
		reason: "URL Helper - Webhook único por canal",
	});

	channelWebhooks.set(channelId, newWebhook);
	return newWebhook;
}
