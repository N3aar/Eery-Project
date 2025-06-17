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

export type DiscordRole = {
  id: string,
  name: string;
  permissions: string;
  color: number;
  colors: {
    primary_color: number,
    secondary_color: number | null,
    tertiary_color: number | null
  }
  hoist: boolean;
  mentionable: boolean;
}
