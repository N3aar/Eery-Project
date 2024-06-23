export enum discordTimestampFormats {
	SHORT_TIME = "t",
	LONG_TIME = "T",
	SHORT_DATE = "d",
	LONG_DATE = "D",
	SHORT_DATE_TIME = "f",
	LONG_DATE_TIME = "F",
	RELATIVE_TIME = "R",
}

export type DiscordUser = {
	banner: string | null;
};
