import { JumbleStatus } from "@/shared/handlers/JumbleGameHandler.js";
import { emojis } from "@/utils/contants.js";
import { calculateSimilarity } from "@/utils/stringFormat.js";
import { container } from "@sapphire/pieces";
import type { Message } from "discord.js";

export default async function answerJumble(message: Message) {
	const channelId = message.channel.id;
	const member = message.member;
	const gameContext =
		container.jumbleGameHandler.getJumbleGameContext(channelId);

	if (!member || !gameContext || gameContext.status === JumbleStatus.STARTING)
		return;

	const input = message.content.toLowerCase().trim();
	const artist = gameContext.artistName.toLowerCase();
	const cleanArtist = gameContext.cleanArtistName;

	const isCorrentAnswer = input === artist || input === cleanArtist;
	const emoji = isCorrentAnswer ? emojis.success : emojis.error;
	const checkSimilarity = !isCorrentAnswer && input.length < artist.length + 3;
	const similarity = checkSimilarity
		? calculateSimilarity(input, cleanArtist)
		: 0;

	if (isCorrentAnswer) {
		await container.jumbleGameHandler.winGame(
			channelId,
			member.id,
			member.displayName,
		);
	}

	await message.react(emoji);

	if (similarity >= 0.8) {
		await message.react(emojis.close);
	}
}
