import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";
import moment from "moment";
import { FaRegHeart as Heart } from "react-icons/fa";
import { FaHeart as FillHeart } from "react-icons/fa";
import { IoChatbubbleOutline as Bubble } from "react-icons/io5";

function formatDate(date: any) {
	const createdAt = moment(date);
	const formattedDate = createdAt.format("YYYY년 MM월 DD일");

	return formattedDate;
}

async function getUser() {
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

async function getPost() {
	const post = await db.post.findMany({
		include: {
			user: true,
			images: true,
			likes: true,
			comments: true,
		},
		orderBy: {
			id: "desc",
		},
	});

	return post;
}

function getIsLiked(likes: any, id: number) {
	var liked = false;
	likes.forEach((like: any) => {
		if (like.userId === id) {
			liked = true;
		}
	});

	return liked;
}

async function Post() {
	const post = await getPost();
	const session = await getSession();

	const likePost = async (formData: FormData) => {
		"use server";
		const session = await getSession();

		const id = formData.get("id");

		await db.like.create({
			data: {
				postId: Number(id),
				userId: session.id!,
			},
		});

		db.$disconnect();
	};

	const dislikePost = async (formData: FormData) => {
		"use server";

		const session = await getSession();

		const id = formData.get("id");

		await db.like.delete({
			where: {
				id: {
					postId: Number(id),
					userId: session.id!,
				},
			},
		});

		db.$disconnect();
	};

	return (
		<div className="w-[40%] h-screen pb-[80px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center  border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
			{post.map((p) => (
				<div className="w-full h-fit flex flex-col items-center mt-4">
					<div className="flex items-center justify-start w-[90%] gap-4">
						<div
							className="size-[50px] border-2 border-[#786657] rounded-full "
							style={{
								backgroundImage: `url(${p.user.avatar})`,
								backgroundSize: "cover",
							}}
						></div>
						<div className="flex flex-col">
							<div className="font-bold">{p.user.username}</div>
							<div className="text-xs">{p.user.email}</div>
						</div>
					</div>

					<img src={p.images[0].url} className="w-[90%]  mt-4"></img>

					<div className="flex w-[90%] mt-4 gap-2 items-center">
						<form
							action={getIsLiked(p.likes, session.id!) ? dislikePost : likePost}
							className="flex items-center"
						>
							<input name="id" value={p.id} className="hidden" readOnly></input>
							<button id={p.id.toString()} className="size-fit">
								{getIsLiked(p.likes, session.id!) ? (
									<FillHeart className="text-red-500" />
								) : (
									<Heart />
								)}
							</button>
						</form>
						<div className="text-xs">{p.likes.length}</div>
						<div className="ml-4">
							<Bubble />
						</div>
						<div className="text-xs">{p.comments.length}</div>
					</div>

					<div className="mt-4 flex justify-start w-[90%]">{p.content}</div>
					<div className="flex justify-start text-xs w-[90%] mt-4">
						{formatDate(p.created_at)}
					</div>

					<div className="w-full h-[2px] bg-[#786657] mt-4"></div>
				</div>
			))}
		</div>
	);
}

export default async function Home() {
	const user = await getUser();

	return (
		// <Suspense fallback={"Loading"}>
		<Post />
		// </Suspense>
	);
}
