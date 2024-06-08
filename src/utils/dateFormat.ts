import dayjs from "dayjs";

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
		String(date.day).padStart(2, "0"),
		String(date.month).padStart(2, "0"),
		String(date.year),
	].filter((part) => part);

	return parts.join("/");
}
