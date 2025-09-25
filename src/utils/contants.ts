export const embedColors = {
	default: 0x9848e8,
	anilist: 0x3db4f2,
	playing: 0x4488ff,
	error: 0xf9576a,
	success: 0x1ed762,
} as const;

export const regexHex = /[0-9a-fA-F]{6}/g;

export const regexUrl = /(https?:\/\/[^\s]+)/g;

export const regexUrlParams = /\?.*$/;

export const adminPermission = 8;

export const maxTimeInSeconds = 180;

export const defaultTimeZone = "America/Sao_Paulo";

export const leaderboardIcon = "https://i.imgur.com/qpb2q9S.png";

export const leaderboardEmojis = ["🥇", "🥈", "🥉"] as const;

export const emojis = {
	error: "❌",
	success: "✅",
	close: "🤏",
} as const;

export enum eventTypes {
	DEFAULT = "DEFAULT",
	BIRTHDAY = "BIRTHDAY",
}

export enum periods {
	MORNING = "MORNING",
	AFTERNOON = "AFTERNOON",
	NIGHT = "NIGHT",
}

export const urlFixers = {
	"https://www.youtube.com/shorts/": "https://youtu.be/",
	"https://www.youtube.com/watch?v=": "https://youtu.be/",
	"https://twitter.com/": "https://vxtwitter.com/",
	"https://x.com/": "https://vxtwitter.com/",
	"https://vm.tiktok.com/": "https://vm.vxtiktok.com/",
	"https://www.tiktok.com/": "https://www.vxtiktok.com/",
	"https://www.instagram.com/": "https://vxinstagram.com/",
	"https://www.reddit.com/": "https://rxddit.com/",
} as const;

export const birthdayVideos = [
	"https://utfs.io/f/3b025c76-33b5-43f3-88ce-6690cb4c596d-z56zy.mp4",
	"https://utfs.io/f/d82a891f-54b2-4322-aaa2-618b3ebf3cde-z56zz.mp4",
	"https://utfs.io/f/8f15b466-6ac0-418d-91e5-3a1ad8a4866a-z5700.mp4",
	"https://utfs.io/f/50ff0549-c66c-49c2-8d78-91002251b4a0-z5701.mp4",
	"https://utfs.io/f/d5265906-9676-48a0-8a1e-8bb5e7f69826-z5702.mp4",
	"https://utfs.io/f/5f2da89f-cffd-42f3-bee6-1320e907f68a-z5703.mp4",
	"https://ixybcdr77k.ufs.sh/f/azNST2svOEPTVrcrDyRHBbspfTSYNQF29AiwRDI8Uxay0r6d",
	"https://ixybcdr77k.ufs.sh/f/azNST2svOEPTbIMwVFQt5GIsgnbUafFYWKeCc4V8TlNqQwDm",
	"https://ixybcdr77k.ufs.sh/f/azNST2svOEPTxQiXSNijG7vhUdqFcoP9se3ZK4VJSmYQRxMg",
] as const;

export const wordsSourceUrl =
	"https://raw.githubusercontent.com/fserb/pt-br/refs/heads/master/data";

export const termoColors = {
	background: "#6e5c62",
	font: "#FAFAFF",
	correct: "#3aa394",
	contain: "#d3ad69",
	incorrect: "#312a2c",
	empty: "#615458",
} as const;

export const termoFormats = {
	single: "Termo",
	double: "Dueto",
	quadruple: "Quarteto",
} as const;

export const termoMaxAttempts = {
	single: 6,
	double: 7,
	quadruple: 9,
} as const;

export type TermoColorKey = keyof typeof termoColors;
export type TermoFormatKey = keyof typeof termoFormats;

export const greetings = [
	"bom dia",
	"boa tarde",
	"boa noite",
	"feliz natal",
	"feliz ano novo",
] as const;

export const translations = {
	group: "grupo",
	person: "pessoa",
	orchestra: "orquestra",
	choir: "coro",
	character: "personagem",
	other: "outro",
	male: "masculino",
	female: "feminino",
	neither: "nenhum",
	not_applicable: "não aplicável",
} as const;

export const fieldTitles = {
	points: "Vitórias",
	bestTime: "Melhor Tempo",
	plays: "Jogadas",
} as const;

export const fieldValues = {
	points: "Pontos",
	bestTime: "Segundos",
	plays: "Vezes",
} as const;

export type TranslationKey = keyof typeof translations;

export const timeRanges = {
	morning: { start: 6, end: 11 },
	afternoon: { start: 12, end: 18 },
	night: { start: 19, end: 5 },
} as const;

export const specialDates = {
	christmas: { day: 25, month: 12 },
	newYear: { day: 1, month: 1 },
} as const;

export const expValues = {
	min: 10,
	max: 25,
	cooldown: 60 * 1000,
} as const;
