import { LogLevel } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { Client } from "./Client.js";

const client = new Client({
	defaultPrefix: "!",
	caseInsensitiveCommands: true,
	logger: {
		level: process.env.NODE_ENV ? LogLevel.Debug : LogLevel.Info,
	},
	intents: [
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildEmojisAndStickers,
	],
	loadMessageCommandListeners: true,
});

client.login(process.env.TOKEN);
