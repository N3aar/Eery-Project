import levenshtein from "js-levenshtein";
import { shuffle } from "./random.js";

const accents = {
	á: "a",
	à: "a",
	ã: "a",
	â: "a",
	ä: "a",
	Á: "A",
	À: "A",
	Ã: "A",
	Â: "A",
	Ä: "A",
	é: "e",
	è: "e",
	ê: "e",
	ë: "e",
	É: "E",
	È: "E",
	Ê: "E",
	Ë: "E",
	í: "i",
	ì: "i",
	î: "i",
	ï: "i",
	Í: "I",
	Ì: "I",
	Î: "I",
	Ï: "I",
	ó: "o",
	ò: "o",
	õ: "o",
	ô: "o",
	ö: "o",
	Ó: "O",
	Ò: "O",
	Õ: "O",
	Ô: "O",
	Ö: "O",
	ú: "u",
	ù: "u",
	û: "u",
	ü: "u",
	Ú: "U",
	Ù: "U",
	Û: "U",
	Ü: "U",
	ç: "c",
	Ç: "C",
	ñ: "n",
	Ñ: "N",
};

type AccentKey = keyof typeof accents;

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
