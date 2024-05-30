import { LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

const client = new SapphireClient({
	defaultPrefix: "!",
	caseInsensitiveCommands: true,
	logger: {
		level: process.env.NODE_ENV ? LogLevel.Debug : LogLevel.Info,
	},
	intents: [
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	],
	loadMessageCommandListeners: true,
});

client.login(process.env.TOKEN);
