import { readdir, readFile } from "fs/promises";
import { join } from "path";
import exifr from "exifr";

interface ImageData {
	filename: string;
	coordinates?: [number, number];
	takenAt?: Date;
}

export async function getImagesData(): Promise<ImageData[]> {
	const imagesDir = join(process.cwd(), "public/img");
	const files = await readdir(imagesDir);

	const imagesData: ImageData[] = [];

	for (const file of files) {
		if (file.match(/\.(jpg|jpeg|png)$/i)) {
			try {
				const buffer = await readFile(join(imagesDir, file));
				const exifData = await exifr.parse(buffer, {
					pick: ["GPSLatitude", "GPSLongitude", "latitude", "longitude", "DateTimeOriginal", "GPSLatitudeRef", "GPSLongitudeRef"],
				});

				console.log(exifData);

				if (exifData) {
					let coordinates: [number, number] | undefined = undefined;

					if (exifData.latitude && exifData.longitude) {
						// GPS 방향 정보 확인
						const longitude = exifData.GPSLongitudeRef === "W" ? -Math.abs(exifData.longitude) : Math.abs(exifData.longitude);
						const latitude = exifData.GPSLatitudeRef === "S" ? -Math.abs(exifData.latitude) : Math.abs(exifData.latitude);

						coordinates = [longitude, latitude];
					}

					imagesData.push({
						filename: file,
						coordinates,
						takenAt: exifData.DateTimeOriginal,
					});
				}
			} catch (error) {
				console.error(`Error processing ${file}:`, error);
			}
		}
	}

	return imagesData;
}
