import { container } from "@sapphire/pieces";
import type { TextChannel } from "discord.js";

type ChannelMessage = {
	channel: TextChannel;
	message: string[];
};

export default async function announceScheduledEvent() {
	const today = new Date();
	const events = await container.db.events.findMany({
		where: {
			month: today.getMonth() + 1,
			day: today.getDate(),
			type: "DEFAULT",
		},
		include: {
			guild: true,
		},
	});

	if (!events || events.length <= 0) return;

	const guilds = container.client.guilds.cache;
	const channelMessages = new Map<string, ChannelMessage>();

	for (const event of events) {
		if (!event.guildId || !event.guild?.mainChannel) continue;

		const guild = guilds.get(event.guild.discordId);
		const channel = guild?.channels.cache.get(event.guild.mainChannel) as
			| TextChannel
			| undefined;

		if (!channel || !guild) continue;

		if (channelMessages.has(channel.id)) {
			const messages = channelMessages.get(channel.id)?.message;
			messages?.push(event.description);
		} else {
			channelMessages.set(channel.id, {
				channel,
				message: [event.description],
			});
		}

		if (!event.repeat) {
			await container.db.events.delete({ where: { id: event.id } });
		}
	}

	for (const channelMessage of channelMessages.values()) {
		const channel = channelMessage.channel;
		channel.send(
			`# Eventos\n${channelMessage.message.map((m) => `- ${m}`).join("\n")}`,
		);
	}
}
