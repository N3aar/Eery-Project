import { greetings, specialDates, timeRanges } from "@/utils/contants.js";
import { capitalize } from "@/utils/stringFormat.js";
import { container } from "@sapphire/pieces";
import type { Message, User } from "discord.js";

type currentDate = {
	hours: number;
	day: number;
	month: number;
};

type hourRange = {
	start: number;
	end: number;
};

type monthRange = {
	day: number;
	month: number;
};

export default async function replyGreeting(message: Message): Promise<void> {
	const content = message.content.toLowerCase();
	const member = message.member;
	const mentioned = message.mentions.has(container.client.user as User);

	if (
		!member ||
		!mentioned ||
		greetings.every((greeting) => !content.includes(greeting))
	)
		return;

	const { hours, day, month } = getCurrentDateTime();
	const greeting = getGreeting(content, hours, day, month);

	if (greeting) {
		await message.channel.send(`${member.toString()} ${greeting}`);
	}
}

function getGreeting(
	content: string,
	hours: number,
	day: number,
	month: number,
): string | null {
	const greetings: { [key: string]: () => boolean } = {
		"bom dia": () => isWithinTimeRange(hours, timeRanges.morning),
		"boa tarde": () => isWithinTimeRange(hours, timeRanges.afternoon),
		"boa noite": () => isWithinTimeRange(hours, timeRanges.night),
		"feliz natal": () => isSpecialDate(day, month, specialDates.christmas),
		"feliz ano novo": () => isSpecialDate(day, month, specialDates.newYear),
	};

	for (const [greeting, condition] of Object.entries(greetings)) {
		if (new RegExp(`\\b${greeting}\\b`).test(content) && condition()) {
			return `${capitalize(greeting)}!`;
		}
	}

	return null;
}

function getCurrentDateTime(): currentDate {
	const date = new Date();
	return {
		hours: date.getHours(),
		day: date.getDate(),
		month: date.getMonth() + 1,
	};
}

function isWithinTimeRange(hours: number, range: hourRange): boolean {
	return range.start <= range.end
		? hours >= range.start && hours <= range.end
		: hours >= range.start || hours <= range.end;
}

function isSpecialDate(day: number, month: number, date: monthRange): boolean {
	return day === date.day && month === date.month;
}
