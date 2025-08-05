import { periods } from "@/utils/contants.js";
import type { Daily } from "@prisma/client";
import { container } from "@sapphire/pieces";
import type { Client, TextChannel } from "discord.js";

import goodAfternoonImages from "../shared/constants/good_afternoon.json" with {
	type: "json",
};
import goodMorningImages from "../shared/constants/good_morning.json" with {
	type: "json",
};
import goodNightImages from "../shared/constants/good_night.json" with {
	type: "json",
};

export default async function sendGoodMorningImage(
	client: Client,
	period: periods,
) {
	const guilds = client.guilds.cache;

	await Promise.all(
		guilds.map(async (guild) => {
			try {
				const guildData = await container.db.guild.findUnique({
					where: {
						discordId: guild.id,
					},
					select: {
						daily: true,
						mainChannel: true,
					},
				});

				const daily = guildData?.daily;
				const mainChannel = guildData?.mainChannel;

				if (!daily || !mainChannel) return;

				const imageUrl = getImageByPeriod(period, daily);
				const channel = guild.channels.cache.get(mainChannel) as TextChannel;

				if (!imageUrl || !channel) return;

				const updatedDaily = updateDailyData(period, daily);

				await container.db.daily.update({
					where: {
						id: daily.id,
					},
					data: {
						...updatedDaily,
					},
				});

				await channel.send(imageUrl);
			} catch (error) {
				console.error("Failed to send good morning image:", error);
			}
		}),
	);
}

function clamp(value: number, max: number): number {
	return value > max ? 0 : value;
}

function getImageByPeriod(period: periods, daily: Daily): string | undefined {
	switch (period) {
		case periods.MORNING:
			return goodMorningImages[daily.day];
		case periods.AFTERNOON:
			return goodAfternoonImages[daily.afternoon];
		case periods.NIGHT:
			return goodNightImages[daily.night];
	}
}

function updateDailyData(period: periods, daily: Daily) {
	if (period === periods.MORNING) {
		daily.day = clamp(daily.day + 1, goodMorningImages.length - 1);
		return daily;
	}

	if (period === periods.AFTERNOON) {
		daily.afternoon = clamp(
			daily.afternoon + 1,
			goodAfternoonImages.length - 1,
		);
		return daily;
	}

	if (period === periods.NIGHT) {
		daily.night = clamp(daily.night + 1, goodNightImages.length - 1);
		return daily;
	}
}
