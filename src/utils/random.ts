export function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getSkewedRandomInt(min: number, max: number) {
	const random = Math.random();
	const skewed = random ** 2;
	return Math.floor(skewed * (max - min + 1)) + min;
}

export function shuffle<T>(array: T[]): T[] {
	const newArray = array.slice();

	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}

	return newArray;
}
