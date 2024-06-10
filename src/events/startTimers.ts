import { CronJob } from "cron";
import announceScheduledEvent from "./announceScheduledEvent.js";
import { defaultTimeZone } from "@/utils/contants.js";

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
