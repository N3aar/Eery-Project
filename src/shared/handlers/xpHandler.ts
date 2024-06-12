import { expValues } from "@/utils/contants.js";
import { getRandomNumber } from "@/utils/random.js";
import { container } from "@sapphire/pieces";
import type { Guild, GuildMember, TextChannel } from "discord.js";

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
		return 5 * (level ^ 2) + 50 * level + 100;
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

	public deleteMemberFromCache(id: string) {
		this.users.delete(id);
	}

	public async addExp(member: GuildMember, guild: Guild, channel: TextChannel) {
		const expStats = await this.getStats(member, guild);

		if (!expStats?.canGetExp) return;

		expStats.exp += getRandomNumber(expValues.min, expValues.max);
		expStats.canGetExp = false;

		const newXp = expStats.exp;
		const xpRequired = this.getRequiredExpAmount(expStats.level);

		if (expStats.exp >= xpRequired) {
			expStats.level++;
			expStats.exp = Math.max(newXp - xpRequired, 0);
			channel.send(
				`${member.toString()} subiu para o nível ${expStats.level}!`,
			);
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
		}, expValues.cooldown);
	}

	public async getStats(member: GuildMember, guild: Guild): Promise<ExpStats> {
		const expMember = this.users.get(member.id) ?? this.createExpMember(member);

		if (!expMember.guilds.has(guild.id)) {
			expMember.guilds.set(guild.id, await this.fetchUserStats(member));
		}

		return expMember.guilds.get(guild.id) ?? this.createExpStats();
	}

	public async getLeaderboard(max: number) {
		return container.db.user.findMany({
			orderBy: {
				level: "desc",
			},
			take: Math.min(max, 25),
		});
	}

	public progressBar(exp: number, level: number, length = 20): string {
		const requiredExp = this.getRequiredExpAmount(level);
		const progress = Math.floor((exp / requiredExp) * length);
		const bar = "▰".repeat(progress) + "▱".repeat(length - progress);

		return `${bar} ${exp}/${requiredExp}`;
	}
}
