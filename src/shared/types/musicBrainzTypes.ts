export type TagData = {
	count: number;
	name: string;
};

export type ArtistData = {
	id: string;
	name: string;
	type: string | null;
	country: string | null;
	gender: string | null;
	disambiguation?: string;
	isnis: string[];
	ipis: string[];
	tags: TagData[];
	"type-id": string | null;
	"gender-id": string | null;
	"sort-name": string | null;
	area: {
		"type-id": string | null;
		"sort-name": string | null;
		"iso-3166-1-codes": string[];
		name: string | null;
		disambiguation: string | null;
		id: string | null;
		type: string | null;
	};
	"begin-area": {
		"type-id": string | null;
		"sort-name": string | null;
		type: string | null;
		id: string;
		name: string | null;
		disambiguation?: string;
	};
	"end-area": {
		"type-id": string | null;
		"sort-name": string | null;
		id: string | null;
		type: string | null;
		name: string | null;
		disambiguation: string | null;
	} | null;
	"life-span": {
		ended: boolean;
		end: string | null;
		begin: string | null;
	};
};
