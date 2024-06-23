import BaseRequest from "@/shared/base/BaseRequest.js";
import type { TopArtistsData, UserArtistData } from "../types/lastFmTypes.js";

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
