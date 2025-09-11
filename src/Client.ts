import ExpHandler from "@/shared/handlers/XpHandler.js";
import { PrismaClient } from "@prisma/client";
import { SapphireClient, container } from "@sapphire/framework";
import type { ClientOptions, Webhook } from "discord.js";
import JumbleGameHandler from "./shared/handlers/JumbleGameHandler.js";
import AnilistAPI from "./shared/integrations/AnilistAPI.js";
import DiscordAPI from "./shared/integrations/DiscordAPI.js";
import LastFmAPI from "./shared/integrations/LastFmAPI.js";
import MusicBrainzAPI from "./shared/integrations/MusicBrainzAPI.js";

export class Client extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);

		container.discordAPI = new DiscordAPI();
		container.anilistAPI = new AnilistAPI();
		container.lastFmAPI = new LastFmAPI();
		container.musicBrainzAPI = new MusicBrainzAPI();

		container.db = new PrismaClient();
		container.expHandler = new ExpHandler();
		container.jumbleGameHandler = new JumbleGameHandler();
		container.webhookCache = new Map();
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		discordAPI: DiscordAPI;
		anilistAPI: AnilistAPI;
		lastFmAPI: LastFmAPI;
		musicBrainzAPI: MusicBrainzAPI;
		db: PrismaClient;
		expHandler: ExpHandler;
		jumbleGameHandler: JumbleGameHandler;
		webhookCache: Map<string, Webhook>;
	}
}
