"use server";
import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const postSchema = z.object({
	photo: z.string(),
});

export async function getUser(id: number) {
	// const session = await getSession();
	const user = await db.user.findUnique({
		where: {
			id: id,
		},
		include: {
			follow: true,
		},
	});
	if (user) {
		// console.log(user);
		return user;
	}
}

export async function getFollowing(id: number) {
	const following = await db.follow.findMany({
		where: {
			userId: id,
		},
	});

	return following;
}

export async function getFollower(id: number) {
	const follower = await db.follow.findMany({
		where: {
			follow: id,
		},
	});

	return follower;
}

export async function getFollows() {
	const followers = await db.follow.findMany({});

	return followers;
}

export async function getPost(id: number) {
	const session = await getSession();
	const post = await db.post.findMany({
		where: {
			userId: id,
		},
		orderBy: {
			id: "desc",
		},
		include: {
			images: true,
		},
	});
	return post;
}

export async function logOut() {
	const session = await getSession();
	session.destroy();
	redirect("/");
}
