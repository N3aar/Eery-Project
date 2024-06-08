import BaseRequest from "@/shared/base/BaseRequest.js";
import type { Media, MediaType } from "../types/anilistTypes.js";

type APIResponse = {
	data: {
		Media: Media;
	};
};

export default class AnilistAPI extends BaseRequest {
	constructor() {
		super("https://graphql.anilist.co", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
	}

	private getMediaQuery(search: string, type: MediaType) {
		return `{
            Media(search: "${search}", type: ${type}) {
              title {
                romaji
                english
                native
              }
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              studios {
                nodes {
                  name
                  isAnimationStudio
                }
              }
              coverImage {
                large
              }
              format
              episodes
              duration
              status
              season
              averageScore
              meanScore
              source
              genres
              isAdult
              siteUrl
              description
            }
        }`;
	}

	public async getMedia(search: string, type: MediaType): Promise<Media> {
		const query = this.getMediaQuery(search, type);

		return await this.post<APIResponse>("", {
			body: JSON.stringify({
				query,
				variables: {},
			}),
		}).then((res) => res.data.Media);
	}
}
