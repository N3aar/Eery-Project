export type MediaType = "ANIME" | "MANGA";

export type Media = {
	title: {
		romaji: string;
		english: string;
		native: string;
	};
	startDate: {
		year: number;
		month: number;
		day: number;
	};
	endDate: {
		year: number;
		month: number;
		day: number;
	};
	studios: {
		nodes: {
			name: string;
			isAnimationStudio: boolean;
		}[];
	};
	coverImage: {
		large: string;
	};
	format: "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";
	episodes: number | null;
	duration: number;
	status:
		| "FINISHED"
		| "RELEASING"
		| "NOT_YET_RELEASED"
		| "CANCELLED"
		| "HIATUS";
	season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
	averageScore: number;
	meanScore: number;
	source:
		| "ORIGINAL"
		| "MANGA"
		| "LIGHT_NOVEL"
		| "VISUAL_NOVEL"
		| "VIDEO_GAME"
		| "OTHER"
		| "NOVEL"
		| "DOUJINSHI"
		| "ANIME";
	genres: string[];
	isAdult: boolean | null;
	siteUrl: string;
	description: string;
};
