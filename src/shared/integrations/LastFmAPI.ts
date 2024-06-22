import BaseRequest from "@/shared/base/BaseRequest.js";

export type ImageData = {
	size: string;
	"#text": string;
};

export type UserArtistData = {
	name: string;
	url: string;
	playcount: 4802;
	stremable: string;
	image: ImageData[];
	mbid?: string | null;
	"@attr": {
		rank: string;
	};
};

type TopArtistsData = {
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

export default class LastFmAPI extends BaseRequest {
	apiKey: string;

	constructor() {
		super("http://ws.audioscrobbler.com/2.0/", {});

		this.apiKey = process.env.LASTFM_APIKEY ?? "";
	}

	private applyApiKey(method: string) {
		return `${method}&api_key=${this.apiKey}`;
	}

	public async getTopArtists(
		username: string,
		limit: number,
		page: number,
	): Promise<UserArtistData[] | null> {
		const data: TopArtistsData = await this.get(
			this.applyApiKey(
				`?method=user.getTopArtists&user=${username}&format=json&limit=${limit}&page=${page}`,
			),
		);

		if (!data) return null;

		return data.topartists.artist;
	}

	public async getTotalArtists(username: string): Promise<number | null> {
		const data: TopArtistsData = await this.get(
			this.applyApiKey(
				`?method=user.getTopArtists&user=${username}&format=json&limit=1`,
			),
		);

		if (!data) return null;

		return Number(data.topartists["@attr"].total);
	}

	public async getArtistInfo(artistName: string): Promise<number> {
		return await this.get(
			this.applyApiKey(
				`?method=artist.getInfo&artist=${encodeURIComponent(
					artistName,
				)}&format=json`,
			),
		);
	}
}
