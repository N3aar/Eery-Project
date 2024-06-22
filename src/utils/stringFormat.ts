import levenshtein from "js-levenshtein";
import { type AccentKey, accents } from "./contants.js";
import { shuffle } from "./random.js";

export function capitalize(text: string) {
	return text
		?.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function replaceUnderlines(text: string, replacer = " ") {
	return text?.replaceAll("_", replacer);
}

export function pad(number: number) {
	return String(number).padStart(2, "0");
}

export function shuffleString(input: string): string {
	const words = input.split(" ");

	const shuffledWords = words.map((word) => {
		const characters = word.split("");
		const shuffledCharacters = shuffle(characters);
		return shuffledCharacters.join("");
	});

	return shuffledWords.join(" ");
}

export function removeAccents(input: string) {
	return input
		.split("")
		.map((char) => accents[char as AccentKey] || char)
		.join("");
}

export function calculateSimilarity(from: string, to: string): number {
	const distance = levenshtein(from, to);
	const maxLength = Math.max(from.length, to.length);
	return 1 - distance / maxLength;
}
