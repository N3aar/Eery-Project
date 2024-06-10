import { container } from "@sapphire/pieces";
import type { Message, TextChannel } from "discord.js";

export default function giveXp(message: Message) {
	const member = message.member;
	const guild = message.guild;
	const channel = message.channel as TextChannel;

	if (!member || !guild || !channel) return;

	container.expHandler.addExp(member, guild, channel);
}
