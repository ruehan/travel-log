"use server";

import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcrypt";

const checkPasswords = ({
	password,
	confirm_password,
}: {
	password: string;
	confirm_password: string;
}) => password === confirm_password;

const formSchema = z
	.object({
		username: z.string().min(3).max(10),
		email: z.string().email(),
		password: z.string().min(10),
		confirm_password: z.string().min(10),
	})
	.superRefine(async ({ username }, ctx) => {
		const user = await db.user.findUnique({
			where: {
				username,
			},
			select: {
				id: true,
			},
		});
		if (user) {
			ctx.addIssue({
				code: "custom",
				message: "This username is already taken.",
				path: ["username"],
				fatal: true,
			});
			await db.$disconnect();
			return z.NEVER;
		}
	})
	.superRefine(async ({ email }, ctx) => {
		const user = await db.user.findUnique({
			where: {
				email,
			},
			select: {
				id: true,
			},
		});
		if (user) {
			ctx.addIssue({
				code: "custom",
				message: "This email is already taken.",
				path: ["email"],
				fatal: true,
			});
			await db.$disconnect();
			return z.NEVER;
		}
	})
	.refine(checkPasswords, {
		message: "Both passwords should be the same.",
		path: ["confirm_password"],
	});

export async function createAccount(prevState: any, formData: FormData) {
	const data = {
		username: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
		confirm_password: formData.get("confirmPassword"),
	};

	const result = await formSchema.spa(data);
	if (!result.success) {
		console.log(result.error.flatten());
		return result.error.flatten();
	} else {
		const hashedPassword = await bcrypt.hash(result.data.password, 12);

		const user = await db.user.create({
			data: {
				username: result.data.username,
				email: result.data.email,
				password: hashedPassword,
			},
			select: {
				id: true,
			},
		});

		const session = await getSession();
		session.id = user.id;
		await session.save();
		await db.$disconnect();
		redirect("/");
	}
}
