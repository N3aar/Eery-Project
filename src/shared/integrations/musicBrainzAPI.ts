import BaseRequest from "@/shared/base/BaseRequest.js";
import type { ArtistData } from "../types/musicBrainzTypes.js";

export default class MusicBrainzAPI extends BaseRequest {
	constructor() {
		super("https://musicbrainz.org/ws/2", {
			headers: {
				"User-Agent": "EeryProject/1.0 (eery-project@outlook.com)",
			},
		});
	}

	public async searchArtist(artistName: string): Promise<ArtistData | null> {
		const data: {
			artists: ArtistData[];
		} = await this.get(
			`artist/?query=${encodeURIComponent(artistName)}&fmt=json`,
		);

		if (!data) return null;

		return data.artists[0];
	}

	public async getArtistInfo(mbid: string): Promise<ArtistData> {
		return await this.get(`artist/${mbid}?inc=tags&fmt=json`);
	}
}
