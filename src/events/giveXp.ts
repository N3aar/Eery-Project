import { container } from "@sapphire/pieces";
import type { Message } from "discord.js";

export default function giveXp(message: Message) {
	const member = message.member;
	const guild = message.guild;

	if (!member || !guild) return;

	container.expHandler.addExp(member, guild);
}
