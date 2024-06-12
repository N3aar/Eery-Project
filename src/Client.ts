import ExpHandler from "@/shared/handlers/xpHandler.js";
import { PrismaClient } from "@prisma/client";
import { SapphireClient, container } from "@sapphire/framework";
import type { ClientOptions } from "discord.js";
import AnilistAPI from "./shared/integrations/AnilistAPI.js";
import DiscordAPI from "./shared/integrations/DiscordAPI.js";

export class Client extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);

		container.discordAPI = new DiscordAPI();
		container.anilistAPI = new AnilistAPI();

		container.db = new PrismaClient();
		container.expHandler = new ExpHandler();
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		discordAPI: DiscordAPI;
		anilistAPI: AnilistAPI;
		db: PrismaClient;
		expHandler: ExpHandler;
	}
}
