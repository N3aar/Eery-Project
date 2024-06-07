import { SapphireClient, container } from "@sapphire/framework";
import type { ClientOptions } from "discord.js";
import { PrismaClient } from "@prisma/client";
import ExpHandler from "@/structures/xpHandler.js";

export class Client extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);

		container.fetch = async <T>(
			endpoint: string,
			options?: Partial<RequestInit>,
		): Promise<T> => {
			const url = `https://discord.com/api/v10/${endpoint}`;
			const response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bot ${process.env.TOKEN}`,
				},
			});
			if (!response.ok)
				throw new Error(`Failed to fetch: ${response.statusText}`);
			return response.json();
		};

		container.db = new PrismaClient();
		container.expHandler = new ExpHandler();
	}
}

declare module "@sapphire/pieces" {
	interface Container {
		fetch: <T>(endpoint: string, options?: Partial<RequestInit>) => Promise<T>;
		db: PrismaClient;
		expHandler: ExpHandler;
	}
}
