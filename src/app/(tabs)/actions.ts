"use server";

import { revalidatePath } from "next/cache";
import db from "../lib/db";
import getSession from "../lib/session";
import { redirect } from "next/navigation";

export async function getUser() {
	const session = await getSession();
	if (session.id) {
		const user = await db.user.findUnique({
			where: {
				id: session.id,
			},
		});
		if (user) {
			return user;
		}
	} else {
		redirect("/create-account");
	}
}

export async function getPost() {
	const post = await db.post.findMany({
		include: {
			user: true,
			images: true,
			likes: true,
			comments: true,
		},
		orderBy: {
			created_at: "desc",
		},
	});

	return post;
}

// export async function getPosts() {
// 	const post = await db.post.findMany({
// 		orderBy: {
// 			id: "desc",
// 		},
// 	});

// 	return post;
// }

export async function getIsLiked(likes: any, id: number) {
	var liked = false;
	likes.forEach((like: any) => {
		if (like.userId === id) {
			liked = true;
		}
	});

	return liked;
}

export async function getMorePosts(page: number) {
	const posts = db.post.findMany({
		include: {
			user: true,
			images: true,
			likes: true,
			comments: true,
		},
		skip: page * 1,
		take: 1,
		orderBy: {
			created_at: "desc",
		},
	});

	return posts;
}

export const likePost = async (formData: FormData) => {
	const session = await getSession();

	const id = formData.get("id");

	try {
		await db.like.create({
			data: {
				postId: Number(id),
				userId: session.id!,
			},
		});
		db.$disconnect();
		revalidatePath("/");
	} catch (error) {
		console.log(error);
	}
};

export const dislikePost = async (formData: FormData) => {
	const session = await getSession();

	const id = formData.get("id");

	try {
		await db.like.delete({
			where: {
				id: {
					postId: Number(id),
					userId: session.id!,
				},
			},
		});
		db.$disconnect();
		revalidatePath("/");
	} catch (error) {
		console.log(error);
	}
};

export const clickPost = async (formData: FormData) => {
	const id = formData.get("id");

	redirect(`/post/${id}`);
};

export const deletePost = async (formData: FormData) => {
	const id = formData.get("id");
	console.log(id);

	const post = await db.post.delete({
		where: {
			id: Number(id),
		},
	});

	revalidatePath("/");
};
