"use server";

import { z } from "zod";
import fs from "fs/promises";
import { json } from "stream/consumers";
import getSession from "@/app/lib/session";
import db from "@/app/lib/db";
import { redirect } from "next/navigation";

const postSchema = z.object({
	photo: z.string(),
	content: z.string(),
});

export async function createPost(_: any, formData: FormData) {
	const data = {
		photo: formData.get("photo"),
		content: formData.get("content"),
	};

	const result = postSchema.safeParse(data);

	if (!result.success) {
		return result.error.flatten();
	} else {
		const session = await getSession();
		if (session.id) {
			const post = await db.post.create({
				data: {
					content: result.data.content,
					user: {
						connect: {
							id: session.id,
						},
					},
				},
				select: {
					id: true,
				},
			});

			const image = await db.image.create({
				data: {
					url: result.data.photo,
					post: {
						connect: {
							id: post.id,
						},
					},
				},
			});
			redirect("/");
		}
	}
}

export async function getUploadUrl() {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ID}/images/v2/direct_upload`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.CLOUDFLARE_KEY}`,
			},
		}
	);
	const data = await response.json();
	console.log(data);
	return data;
}
