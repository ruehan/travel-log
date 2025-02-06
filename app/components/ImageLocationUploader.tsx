import { useState, useCallback } from "react";
import exifr from "exifr";
import { convertDMSToDD } from "../utils/coordinates";

interface ImageLocation {
	lat: number;
	lng: number;
	title: string;
	imageUrl: string;
}

interface ImageLocationUploaderProps {
	onLocationsUpdate: (locations: ImageLocation[]) => void;
}

export default function ImageLocationUploader({ onLocationsUpdate }: ImageLocationUploaderProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleImageUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files) return;

			setIsLoading(true);
			setError(null);

			try {
				for (const file of files) {
					// EXIF 데이터 추출
					const exifData = await exifr.parse(file, [
						"GPSLatitude",
						"GPSLongitude",
						"DateTimeOriginal",
						"GPSLatitudeRef",
						"GPSLongitudeRef",
					]);

					if (!exifData?.GPSLatitude || !exifData?.GPSLongitude) {
						// console.log("위치 정보가 없는 사진:", file.name);
						continue;
					}

					// console.log("원본 EXIF 데이터:", exifData);

					// DMS를 십진수로 변환
					const lat = convertDMSToDD(
						exifData.GPSLatitude[0],
						exifData.GPSLatitude[1],
						exifData.GPSLatitude[2],
						exifData.GPSLatitudeRef || "N"
					);

					const lng = convertDMSToDD(
						exifData.GPSLongitude[0],
						exifData.GPSLongitude[1],
						exifData.GPSLongitude[2],
						exifData.GPSLongitudeRef || "E"
					);

					// 파일을 URL로 변환
					const imageUrl = URL.createObjectURL(file);

					// 위치 정보 전달
					onLocationsUpdate([
						{
							lat,
							lng,
							title: file.name,
							imageUrl,
						},
					]);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
				console.error("업로드 오류:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[onLocationsUpdate]
	);

	return (
		<div className="mb-4">
			<input
				type="file"
				accept="image/*"
				multiple
				onChange={handleImageUpload}
				disabled={isLoading}
				className="mb-2"
			/>
			{isLoading && <p className="text-blue-600">이미지 처리 중...</p>}
			{error && <p className="text-red-600">{error}</p>}
		</div>
	);
}
