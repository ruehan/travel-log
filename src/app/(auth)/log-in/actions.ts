"use server";

import db from "@/app/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";

const checkUserExists = async (username: string) => {
	const user = await db.user.findUnique({
		where: {
			username,
		},
		select: {
			id: true,
		},
	});

	return Boolean(user);
};

const formSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(10)
		.refine(checkUserExists, "An account with this username does not exist."),
	password: z.string({ required_error: "Password is required." }),
});

export async function LogIn(prevdata: any, formData: FormData) {
	const data = {
		username: formData.get("username"),
		password: formData.get("password"),
	};

	const result = await formSchema.spa(data);
	if (!result.success) {
		return result.error.flatten();
	} else {
		const user = await db.user.findUnique({
			where: {
				username: result.data.username,
			},
			select: {
				id: true,
				password: true,
			},
		});
		const ok = await bcrypt.compare(
			result.data.password,
			user!.password ?? "xxxx"
		);

		if (ok) {
			const session = await getSession();
			session.id = user!.id;
			await session.save();
			await db.$disconnect();
			redirect("/");
		} else {
			return {
				fieldErrors: {
					password: ["Wrong password."],
					username: [],
				},
			};
		}
	}
}
