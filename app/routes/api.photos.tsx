import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/db.server";

export const action: ActionFunction = async ({ request }) => {
	if (request.method !== "POST") {
		return json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		// DMS 형식의 좌표 데이터 파싱
		const latitudeDegrees = parseFloat(formData.get("latitudeDegrees") as string);
		const latitudeMinutes = parseFloat(formData.get("latitudeMinutes") as string);
		const latitudeSeconds = parseFloat(formData.get("latitudeSeconds") as string);
		const latitudeRef = formData.get("latitudeRef") as string;

		const longitudeDegrees = parseFloat(formData.get("longitudeDegrees") as string);
		const longitudeMinutes = parseFloat(formData.get("longitudeMinutes") as string);
		const longitudeSeconds = parseFloat(formData.get("longitudeSeconds") as string);
		const longitudeRef = formData.get("longitudeRef") as string;

		const takenAt = formData.get("takenAt") as string;
		const title = formData.get("title") as string;

		// 디버깅을 위한 로그
		console.log("받은 DMS 데이터:", {
			latitude: [latitudeDegrees, latitudeMinutes, latitudeSeconds, latitudeRef],
			longitude: [longitudeDegrees, longitudeMinutes, longitudeSeconds, longitudeRef],
			takenAt,
			title,
		});

		// Cloudflare Images 업로드 URL 받아오기
		const uploadUrlResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
			},
		});

		if (!uploadUrlResponse.ok) {
			throw new Error("Upload URL 요청 실패");
		}

		const { result } = await uploadUrlResponse.json();
		const { uploadURL, id } = result;

		// 이미지 업로드
		const cloudflareFormData = new FormData();
		cloudflareFormData.append("file", file);

		const uploadResponse = await fetch(uploadURL, {
			method: "POST",
			body: cloudflareFormData,
		});

		if (!uploadResponse.ok) {
			throw new Error("이미지 업로드 실패");
		}

		// 이미지 URL 생성
		const imageUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}/${id}/public`;

		// Prisma를 사용하여 데이터베이스에 DMS 형식으로 저장
		const photo = await db.photo.create({
			data: {
				imageUrl,
				latitudeDegrees,
				latitudeMinutes,
				latitudeSeconds,
				latitudeRef,
				longitudeDegrees,
				longitudeMinutes,
				longitudeSeconds,
				longitudeRef,
				takenAt: new Date(takenAt),
				title,
			},
		});

		return json({ success: true, imageUrl, photo });
	} catch (error) {
		console.error("업로드 에러:", error);
		return json({ error: error instanceof Error ? error.message : "Unknown error occurred" }, { status: 500 });
	}
};
