import type { GuildMember, Guild } from "discord.js";
import { ExpValues } from "@/utils/contants.js";
import { container } from "@sapphire/pieces";

export type ExpStats = {
	exp: number;
	level: number;
	canGetExp: boolean;
};

export type ExpMember = {
	guilds: Map<string, ExpStats>;
	member: GuildMember;
};

export default class ExpHandler {
	users: Map<string, ExpMember>;

	constructor() {
		this.users = new Map();
	}

	private createExpMember(member: GuildMember): ExpMember {
		return {
			guilds: new Map(),
			member,
		};
	}

	private createExpStats(): ExpStats {
		return {
			exp: 0,
			level: 1,
			canGetExp: true,
		};
	}

	private getRequiredExpAmount(level: number): number {
		return Math.floor(ExpValues.xpBase * ExpValues.xpFactor ** level);
	}

	private async fetchUserStats(member: GuildMember): Promise<ExpStats> {
		const user = await container.db.user.findUnique({
			where: {
				discordId: member.id,
			},
		});

		return {
			exp: user?.xp ?? 0,
			level: user?.level ?? 1,
			canGetExp: true,
		};
	}

	public async addExp(member: GuildMember, guild: Guild) {
		const expStats = await this.getStats(member, guild);

		if (!expStats?.canGetExp) return;

		expStats.exp += ExpValues.byMessage;
		expStats.canGetExp = false;

		const newXp = expStats.exp;
		const xpRequired = this.getRequiredExpAmount(expStats.level);

		if (expStats.exp >= xpRequired) {
			expStats.level++;
			expStats.exp = Math.max(newXp - xpRequired, 0);
		}

		await container.db.user.upsert({
			where: {
				discordId: member.id,
			},
			update: {
				xp: expStats.exp,
				level: expStats.level,
			},
			create: {
				discordId: member.id,
				xp: expStats.exp,
				level: expStats.level,
			},
		});

		const expMember = this.users.get(member.id) ?? this.createExpMember(member);
		expMember.guilds.set(guild.id, expStats);
		this.users.set(member.id, expMember);

		setTimeout(() => {
			expStats.canGetExp = true;
		}, ExpValues.cooldown);
	}

	public async getStats(member: GuildMember, guild: Guild): Promise<ExpStats> {
		const expMember = this.users.get(member.id) ?? this.createExpMember(member);

		if (!expMember.guilds.has(guild.id)) {
			expMember.guilds.set(guild.id, await this.fetchUserStats(member));
		}

		return expMember.guilds.get(guild.id) ?? this.createExpStats();
	}

	public async getLeaderboard() {
		return container.db.user.findMany({
			orderBy: {
				xp: "desc",
			},
			take: 15,
		});
	}

	public progressBar(exp: number, level: number, length = 20): string {
		const requiredExp = this.getRequiredExpAmount(level);
		const progress = Math.floor((exp / requiredExp) * length);
		const bar = "▰".repeat(progress) + "▱".repeat(length - progress);
		return `[${bar}] ${exp}/${requiredExp}`;
	}
}
