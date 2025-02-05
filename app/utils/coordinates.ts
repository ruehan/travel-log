export function convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string): number {
	let dd = degrees + minutes / 60 + seconds / 3600;
	if (direction === "S" || direction === "W") {
		dd = -dd;
	}
	return dd;
}
