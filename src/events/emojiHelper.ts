import type { TextChannel, Message } from "discord.js";
import { container } from "@sapphire/pieces";

export default async function emojiHelper(message: Message) {
	const clientEmojis = container.client.emojis.cache;
	const emotes = clientEmojis?.map((emoji) => emoji.toString());

	if (!emotes) return;

	const regex = /(?<!<\w?):(\w+):(?!\d+>)/g;
	const content = message.content;
	const catchedEmojis = content.match(regex);

	if (
		!catchedEmojis?.length ||
		catchedEmojis?.every((emoji) =>
			clientEmojis.every((emojiData) => `:${emojiData.name}:` !== emoji),
		)
	)
		return;

	const fixed = message.content.replace(regex, (match, name) => {
		if (emotes.includes(match)) return match;
		return (
			clientEmojis.find((emojiData) => emojiData.name === name)?.toString() ||
			""
		);
	});

	if (fixed.length) {
		if (message.deletable) {
			message.delete();
		}

		const channel = message.channel as TextChannel;
		const member = message.member;

		if (member) {
			const webhook = await channel.createWebhook({
				name: member?.displayName ?? member.user.username,
				avatar: member.displayAvatarURL({ forceStatic: false }),
				reason: "Emoji Helper!",
			});

			await webhook.send(fixed);
			webhook.delete();
		}
	}
}
