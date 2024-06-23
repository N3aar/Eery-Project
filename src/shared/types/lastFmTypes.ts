export type ImageData = {
	size: string;
	"#text": string;
};

export type UserArtistData = {
	name: string;
	url: string;
	playcount: number;
	stremable: string;
	image: ImageData[];
	mbid?: string | null;
	"@attr": {
		rank: string;
	};
};

export type TopArtistsData = {
	topartists: {
		artist: UserArtistData[];
		"@attr": {
			user: string;
			totalPages: string;
			page: string;
			perPage: string;
			total: string;
		};
	};
};
