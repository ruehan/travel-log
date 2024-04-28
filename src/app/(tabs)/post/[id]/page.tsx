import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { formatDate } from "@/app/lib/utils";
import { revalidatePath } from "next/cache";
import { FaRegHeart as Heart } from "react-icons/fa";
import { FaHeart as FillHeart } from "react-icons/fa";
import { IoChatbubbleOutline as Bubble } from "react-icons/io5";
import { FaTrash as Delete } from "react-icons/fa";
import Image from "next/image";

async function getPost(id: number) {
	const post = await db.post.findUnique({
		where: {
			id: id,
		},
		include: {
			user: true,
			images: true,
			likes: true,
			comments: true,
		},
	});

	return post;
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
	}
}

async function getComment(id: number) {
	const comments = db.comment.findMany({
		where: {
			postId: id,
		},
		include: {
			user: true,
		},
	});

	return comments;
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

export default async function PostDetail({
	params,
}: {
	params: { id: string };
}) {
	const id = Number(params.id);
	const post = await getPost(id);
	const comment = await getComment(id);
	const session = await getSession();
	const user = await getUser();

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
		revalidatePath(`/post/${id}`);

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

		revalidatePath(`/post/${id}`);

		db.$disconnect();
	};

	const deleteComment = async (formData: FormData) => {
		"use server";
		const id = formData.get("id");
		const postId = formData.get("postId");
		console.log(id);

		const comment = await db.comment.delete({
			where: {
				id: Number(id),
			},
		});

		revalidatePath(`/post/${postId}`);
	};

	const addComment = async (formData: FormData) => {
		"use server";
		const id = formData.get("id");
		const comment = formData.get("comment");

		const addComment = await db.comment.create({
			data: {
				text: comment?.toString()!,
				user: {
					connect: {
						id: session.id,
					},
				},
				post: {
					connect: {
						id: post?.id,
					},
				},
			},
		});

		revalidatePath(`/post/${post?.id}`);
	};

	return (
		<>
			<div className="w-[40%] h-screen pb-[150px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
				<div className="w-full h-fit flex flex-col items-center mt-4">
					<div className="flex items-center justify-start w-[90%] gap-4 relative">
						<div
							className="size-[50px] border-2 border-[#786657] rounded-full "
							style={{
								backgroundImage: `url(${post?.user.avatar})`,
								backgroundSize: "cover",
							}}
						></div>
						<div className="flex flex-col">
							<div className="font-bold">{post?.user.username}</div>
							<div className="text-xs">{post?.user.email}</div>
						</div>
					</div>
					{post?.images[0].url !==
						"https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg//public" && (
						// <img src={post?.images[0].url} className="w-[90%]  mt-4"></img>
						<Image
							src={post?.images[0].url!}
							className="w-[90%] mt-4"
							width={200}
							height={200}
							alt="Photo"
							quality={100}
						/>
					)}
					<div className="flex w-[90%] mt-4 gap-2 items-center">
						<form
							action={
								getIsLiked(post?.likes, session.id!) ? dislikePost : likePost
							}
							className="flex items-center"
						>
							<input
								name="id"
								value={post?.id}
								className="hidden"
								readOnly
							></input>
							<button id={post?.id.toString()} className="size-fit">
								{getIsLiked(post?.likes, session.id!) ? (
									<FillHeart className="text-red-500" />
								) : (
									<Heart />
								)}
							</button>
						</form>
						<div className="text-xs">{post?.likes.length}</div>
						<div className="ml-4">
							<div className="size-fit">
								<Bubble />
							</div>
						</div>
						<div className="text-xs">{post?.comments.length}</div>
					</div>
					<div className="mt-4 flex justify-start w-[90%]">{post?.content}</div>
					<div className="flex justify-start text-xs w-[90%] mt-4">
						{formatDate(post?.created_at)}
					</div>

					<div className="w-full h-[2px] bg-[#786657] mt-4"></div>

					{comment?.map((comment) => (
						<div
							key={comment.id}
							className="w-full h-fit flex flex-col items-center mt-8"
						>
							<div className="flex items-center justify-start w-[90%] gap-4 relative">
								<div
									className="size-[40px] min-w-[40px] border-2 border-[#786657] rounded-full"
									style={{
										backgroundImage: `url(${comment.user.avatar})`,
										backgroundSize: "cover",
									}}
								></div>
								<div className="flex flex-col w-full gap-2">
									<div className="flex gap-4 items-center">
										<div className="font-bold">{comment.user.username}</div>
										<div className="text-xs">
											{formatDate(comment.created_at)}
										</div>
										{comment.user.id === session.id && (
											<form action={deleteComment}>
												<input
													name="id"
													value={comment.id}
													className="hidden"
													readOnly
												></input>
												<input
													name="postId"
													value={post?.id}
													className="hidden"
													readOnly
												></input>
												<button className="size-fit ">
													<Delete />
												</button>
											</form>
										)}
									</div>
									<div className="text-xs">{comment.text}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<form
				action={addComment}
				className=" h-[60px] border-[#786657] bg-[#ddc8ae] fixed bottom-[64px] left-[50%] translate-x-[-50%] border-x-2 border-t-2  w-[40%] flex items-center justify-around px-4 gap-4"
			>
				<div
					className="size-[40px] border-2 border-[#786657] rounded-full "
					style={{
						backgroundImage: `url(${user?.avatar})`,
						backgroundSize: "cover",
					}}
				></div>
				<input name="id" value={user?.id} className="hidden" readOnly></input>
				<input
					name="comment"
					className="bg-inherit h-[30px] w-[70%]"
					placeholder="댓글 입력"
				></input>
				<button className="bg-inherit size-fit p-2 font-bold flex flex-nowrap">
					게시
				</button>
			</form>
		</>
	);
}
