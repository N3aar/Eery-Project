import type { Message } from "discord.js";

const sites = {
	"https://www.youtube.com/shorts/": "https://youtu.be/",
	"https://www.youtube.com/watch?v=": "https://youtu.be/",
	"https://twitter.com/": "https://vxtwitter.com/",
	"https://x.com/": "https://vxtwitter.com/",
	"https://www.tiktok.com/": "https://www.vxtiktok.com/",
	"https://www.instagram.com/": "https://g.ddinstagram.com/",
	"https://www.reddit.com/": "https://rxddit.com/",
	"https://vm.tiktok.com/": "https://vm.vxtiktok.com/",
};

export default function urlHelper(message: Message) {
	const content = message.content;
	const regex = /(https?:\/\/[^\s]+)/g;
	const urls = content.match(regex);
	const fixes = Object.entries(sites);

	if (
		!urls ||
		!urls.length ||
		urls.every((url) => fixes.every(([site]) => !url.includes(site)))
	)
		return;

	const fixedUrls = urls.map((url) => {
		let newUrl = url;
		for (const [site, replacement] of fixes) {
			if (newUrl.includes(site)) {
				newUrl = newUrl.replace(site, replacement);
			}
		}
		return newUrl;
	});

	message.suppressEmbeds(true);
	message.reply({
		content: fixedUrls.join("\n"),
		allowedMentions: { repliedUser: false },
	});
}
