import { defaultTimeZone, periods } from "@/utils/contants.js";
import { CronJob } from "cron";
import type { Client } from "discord.js";
import announceScheduledEvent from "./announceScheduledEvent.js";
import sendGoodMorningImage from "./sendGoodMorningImage.js";

function createCronJob(cronTime: string, onTick: () => void) {
	new CronJob(cronTime, onTick, null, true, defaultTimeZone);
}

export default function startTimers(client: Client) {
	// Events
	createCronJob("0 0 * * *", () => {
		announceScheduledEvent();
	});

	// Good Morning Message
	createCronJob("0 6 * * *", () => {
		sendGoodMorningImage(client, periods.MORNING);
	});

	// Good Afternoon Message
	createCronJob("0 12 * * *", () => {
		sendGoodMorningImage(client, periods.AFTERNOON);
	});

	// Good Night Message
	createCronJob("0 19 * * *", () => {
		sendGoodMorningImage(client, periods.NIGHT);
	});
}
