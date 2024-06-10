import { defaultTimeZone } from "@/utils/contants.js";
import { CronJob } from "cron";
import announceScheduledEvent from "./announceScheduledEvent.js";

export default function startTimers() {
	new CronJob(
		"* * * * *",
		() => {
			announceScheduledEvent();
		},
		null,
		true,
		defaultTimeZone,
	);
}
