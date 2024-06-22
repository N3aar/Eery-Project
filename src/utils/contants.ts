export const embedColors = {
	default: 0xed3939,
	anilist: 0x3db4f2,
	playing: 0x4488ff,
	error: 0xf9576a,
	success: 0x1ed762,
};

export const adminPermission = 8;

export const defaultTimeZone = "America/Sao_Paulo";

export const leaderboardIcon = "https://i.imgur.com/qpb2q9S.png";

export const leaderboardEmojis = ["🥇", "🥈", "🥉"];

export const emojis = {
	error: "❌",
	success: "✅",
	close: "🤏",
};

export enum eventTypes {
	DEFAULT = "DEFAULT",
	BIRTHDAY = "BIRTHDAY",
}

export enum periods {
	MORNING = "MORNING",
	AFTERNOON = "AFTERNOON",
	NIGHT = "NIGHT",
}

export enum discordTimestampFormats {
	SHORT_TIME = "t",
	LONG_TIME = "T",
	SHORT_DATE = "d",
	LONG_DATE = "D",
	SHORT_DATE_TIME = "f",
	LONG_DATE_TIME = "F",
	RELATIVE_TIME = "R",
}

export const urlFixers = {
	"https://www.youtube.com/shorts/": "https://youtu.be/",
	"https://www.youtube.com/watch?v=": "https://youtu.be/",
	"https://twitter.com/": "https://vxtwitter.com/",
	"https://x.com/": "https://vxtwitter.com/",
	"https://vm.tiktok.com/": "https://vm.vxtiktok.com/",
	"https://www.tiktok.com/": "https://www.vxtiktok.com/",
	"https://www.instagram.com/": "https://g.ddinstagram.com/",
	"https://www.reddit.com/": "https://rxddit.com/",
};

export const birthdayVideos = [
	"https://utfs.io/f/3b025c76-33b5-43f3-88ce-6690cb4c596d-z56zy.mp4",
	"https://utfs.io/f/d82a891f-54b2-4322-aaa2-618b3ebf3cde-z56zz.mp4",
	"https://utfs.io/f/8f15b466-6ac0-418d-91e5-3a1ad8a4866a-z5700.mp4",
	"https://utfs.io/f/50ff0549-c66c-49c2-8d78-91002251b4a0-z5701.mp4",
	"https://utfs.io/f/d5265906-9676-48a0-8a1e-8bb5e7f69826-z5702.mp4",
	"https://utfs.io/f/5f2da89f-cffd-42f3-bee6-1320e907f68a-z5703.mp4",
];

export const greetings = [
	"bom dia",
	"boa tarde",
	"boa noite",
	"feliz natal",
	"feliz ano novo",
];

export const translations = {
	group: "grupo",
	person: "pessoa",
	orchestra: "orquestra",
	choir: "Coro",
	character: "Personagem",
	other: "Outro",
	male: "masculino",
	female: "feminino",
};

export type TranslationKey = keyof typeof translations;

export const timeRanges = {
	morning: { start: 6, end: 11 },
	afternoon: { start: 12, end: 18 },
	night: { start: 19, end: 5 },
};

export const specialDates = {
	christmas: { day: 25, month: 12 },
	newYear: { day: 1, month: 1 },
};

export const expValues = {
	min: 10,
	max: 25,
	cooldown: 60 * 1000,
};

export const accents = {
	á: "a",
	à: "a",
	ã: "a",
	â: "a",
	ä: "a",
	Á: "A",
	À: "A",
	Ã: "A",
	Â: "A",
	Ä: "A",
	é: "e",
	è: "e",
	ê: "e",
	ë: "e",
	É: "E",
	È: "E",
	Ê: "E",
	Ë: "E",
	í: "i",
	ì: "i",
	î: "i",
	ï: "i",
	Í: "I",
	Ì: "I",
	Î: "I",
	Ï: "I",
	ó: "o",
	ò: "o",
	õ: "o",
	ô: "o",
	ö: "o",
	Ó: "O",
	Ò: "O",
	Õ: "O",
	Ô: "O",
	Ö: "O",
	ú: "u",
	ù: "u",
	û: "u",
	ü: "u",
	Ú: "U",
	Ù: "U",
	Û: "U",
	Ü: "U",
	ç: "c",
	Ç: "C",
	ñ: "n",
	Ñ: "N",
};

export type AccentKey = keyof typeof accents;
