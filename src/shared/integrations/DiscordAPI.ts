import BaseRequest from "@/shared/base/BaseRequest.js";
import type { DiscordRole, DiscordUser } from "../types/discordTypes.js";

export default class DiscordAPI extends BaseRequest {
	constructor() {
		super("https://discord.com/api/v10", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${process.env.TOKEN}`,
			},
		});
	}

	public async getUser(id: string): Promise<DiscordUser> {
		return await this.get(`users/${id}`);
	}

	public async createRole(
		guildId: string,
		roleData: Partial<DiscordRole>,
	): Promise<DiscordRole> {
		return await this.post(`guilds/${guildId}/roles`, {
			body: JSON.stringify(roleData),
		});
	}
}
