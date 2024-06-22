import dayjs from "dayjs";
import type { discordTimestampFormats } from "./contants.js";

type DateObject = {
	day?: number;
	month?: number;
	year?: number;
};

export function dateToCron(dateStr: string) {
	const date = dayjs(dateStr, "DD/MM/YY HH:mm");

	const minute = date.format("m");
	const hour = date.format("H");
	const day = date.format("D");
	const month = date.format("M");
	const year = date.format("YYYY");

	return `${minute} ${hour} ${day} ${month} * ${year}`;
}

export function formatDate(date: DateObject): string {
	const parts = [
		date.day ? String(date.day).padStart(2, "0") : undefined,
		date.month ? String(date.month).padStart(2, "0") : undefined,
		date.year ? String(date.year) : undefined,
	].filter((part) => part);

	return parts.join("/");
}

export function convertToDiscordTimestamp(
	date: string,
	format: discordTimestampFormats,
): string {
	const timestamp = Math.floor(new Date(date).getTime() / 1000);
	return `<t:${timestamp}:${format}>`;
}
