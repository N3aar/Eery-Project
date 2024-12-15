import { birthdayVideos } from "@/utils/contants.js";
import { container } from "@sapphire/pieces";
import type { MessageCreateOptions, TextChannel } from "discord.js";

type ChannelMessage = {
	channel: TextChannel;
	events: {
		type: string;
		description: string;
		createdBy: string;
	}[];
};

export default async function announceScheduledEvent() {
	const today = new Date();
	const events = await container.db.events.findMany({
		where: {
			month: today.getMonth() + 1,
			day: today.getDate(),
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
			const events = channelMessages.get(channel.id)?.events;
			events?.push({
				description: event.description,
				type: event.type,
				createdBy: event.createdBy ?? "",
			});
		} else {
			channelMessages.set(channel.id, {
				channel,
				events: [
					{
						description: event.description,
						type: event.type,
						createdBy: event.createdBy ?? "",
					},
				],
			});
		}

		if (!event.repeat) {
			await container.db.events.delete({ where: { id: event.id } });
		}
	}

	for (const channelMessage of channelMessages.values()) {
		const channel = channelMessage.channel;
		const eventsMsg = channelMessage.events
			.filter((event) => event.type === "DEFAULT")
			.map((event) => `- ${event.description}`);

		const birthdayUsers = channelMessage.events
			.filter((event) => event.type === "BIRTHDAY" && event.createdBy)
			.map((event) => `<@${event.createdBy}>`);

		const hasBirthdays = birthdayUsers.length > 0;
		const birthdayMessage =
			hasBirthdays &&
			`${birthdayUsers.join(" & ")}, Feliz Aniversário! :partying_face: :tada:`;

		const formatedMessages = [
			eventsMsg.length > 0 ? `# Eventos\n${eventsMsg.join("\n")}` : "",
			hasBirthdays ? birthdayMessage : "",
		];

		const message: MessageCreateOptions = {
			content: formatedMessages.join("\n\n"),
		};

		if (hasBirthdays) {
			const random = birthdayVideos[Math.random() * birthdayVideos.length];

			message.files = [
				{
					attachment: random,
					name: "happy_birthday.mp4",
					description: "Happy Birthday",
				},
			];
		}

		channel.send(message);
	}
}
