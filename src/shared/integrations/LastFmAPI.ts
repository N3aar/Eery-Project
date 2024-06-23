import BaseRequest from "@/shared/base/BaseRequest.js";
import type { TopArtistsData, UserArtistData } from "../types/lastFmTypes.js";

export default class LastFmAPI extends BaseRequest {
	constructor() {
		super(
			"http://ws.audioscrobbler.com/2.0",
			{},
			{
				api_key: process.env.LASTFM_APIKEY ?? "",
			},
		);
	}

	public async getTopArtists(
		username: string,
		limit: number,
		page: number,
	): Promise<UserArtistData[] | null> {
		const data: TopArtistsData = await this.get(
			`?method=user.getTopArtists&user=${username}&format=json&limit=${limit}&page=${page}`,
		);

		if (!data) return null;

		return data.topartists.artist;
	}

	public async getTotalArtists(username: string): Promise<number | null> {
		const data: TopArtistsData = await this.get(
			`?method=user.getTopArtists&user=${username}&format=json&limit=1`,
		);

		if (!data) return null;

		return Number(data.topartists["@attr"].total);
	}

	public async getArtistInfo(artistName: string): Promise<number> {
		return await this.get(
			`?method=artist.getInfo&artist=${encodeURIComponent(
				artistName,
			)}&format=json`,
		);
	}
}
