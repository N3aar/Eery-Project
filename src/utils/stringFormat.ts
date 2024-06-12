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
