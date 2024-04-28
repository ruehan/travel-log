import getSession from "@/app/lib/session";
import {
	getFollower,
	getFollowing,
	getFollows,
	getPost,
	getUser,
	logOut,
} from "./actions";
import Link from "next/link";
import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import Image from "next/image";

function getIsFollow(follows: any, session_id: number, profile_id: number) {
	var followed = false;
	// console.log(follows);

	if (follows.length === 0) {
		return false;
	}

	follows.forEach((follow: any) => {
		if (follow.follow === profile_id && follow.userId === session_id) {
			followed = true;
		}
	});

	return followed;
}

async function User({ userId }: { userId: number }) {
	const user = await getUser(userId);
	const follow = await getFollowing(userId);
	const session = await getSession();
	const follows = await getFollows();

	const follower = await getFollower(userId);
	const followUser = async (formData: FormData) => {
		"use server";

		const session = await getSession();
		const profileId = formData.get("id");

		try {
			await db.follow.create({
				data: {
					follow: Number(profileId),
					userId: session.id!,
				},
			});
			db.$disconnect();
			revalidatePath(`/profile/${profileId}`);
		} catch (error) {
			console.log(error);
		}
	};

	const unFollowUser = async (formData: FormData) => {
		"use server";

		const session = await getSession();
		const profileId = formData.get("id");

		const data = await db.follow.findMany({});
		const follow = data.filter(
			(dt) => dt.follow === Number(profileId) && dt.userId === session.id!
		);
		// console.log(follow);
		try {
			await db.follow.delete({
				where: {
					id: follow[0].id,
				},
			});
			db.$disconnect();
			revalidatePath(`/profile/${profileId}`);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<div className="flex justify-around w-full h-fit mt-8">
				<Link
					href={`/follower/${user?.id}`}
					className="flex flex-col items-center justify-center"
				>
					<div className="font-bold text-lg">{follower?.length}</div>
					<div className="text-xs">follower</div>
				</Link>
				<div className="flex flex-col items-center justify-center">
					<div
						className="size-[100px] rounded-full"
						style={{
							backgroundImage: `url(${user?.avatar})`,
							backgroundSize: "cover",
						}}
					></div>
					<div className="font-bold text-lg">{user?.username}</div>
					<div className="text-xs">{user?.email}</div>
				</div>
				<Link
					href={`/following/${user?.id}`}
					className="flex flex-col items-center justify-center"
				>
					<div className="font-bold text-lg">{follow.length}</div>
					<div className="text-xs">following</div>
				</Link>
			</div>
			{session.id === user?.id ? (
				<div className="w-full h-fit flex justify-around mt-6">
					<Link
						href={`/profile/${user?.id}/?show=true`}
						className="w-[30%] border-2 border-[#786657] bg-[#ddc8ae] flex justify-center items-center py-2 rounded-xl"
					>
						프로필 수정
					</Link>
					<form
						action={logOut}
						className="w-[30%] border-2 border-[#786657] bg-[#ddc8ae] flex justify-center items-center py-2 rounded-xl"
					>
						<button>로그아웃</button>
					</form>
				</div>
			) : (
				<div className="w-full h-fit flex justify-around mt-6">
					<form
						action={
							getIsFollow(follows, session.id!, userId)
								? unFollowUser
								: followUser
						}
						className="w-[30%] border-2 border-[#786657] bg-[#ddc8ae] flex justify-center items-center py-2 rounded-xl"
					>
						<input name="id" value={userId} className="hidden" readOnly></input>
						<button>
							{getIsFollow(follows, session.id!, userId)
								? "팔로우 취소"
								: "팔로우"}
						</button>
					</form>
				</div>
			)}
		</>
	);
}

async function Post({ userId }: { userId: number }) {
	const post = await getPost(userId);

	return (
		<div className="w-full h-fit min-h-[100px] grid grid-cols-3 mt-10 gap-2 p-2 ">
			{post.map((p) => (
				<Link
					key={p.id}
					href={`/post/${p.id}`}
					className="size-[100%] flex justify-center items-center bg-[#ddc8ae]"
				>
					{p.images[0].url !==
					"https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg//public" ? (
						<Image
							src={p.images[0].url}
							className="w-[100%]"
							width={200}
							height={200}
							// fill
							alt="Photo"
							quality={100}
						/>
					) : (
						<div className="text-xs flex justify-center">{p.content}</div>
					)}
				</Link>
			))}
		</div>
	);
}

export default async function Profile({ params }: { params: { id: string } }) {
	const userId = Number(params.id);
	if (isNaN(userId)) {
		return;
	}
	return (
		<>
			<div className="w-[40%] h-screen pb-[700px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
				<User userId={userId} />
				<Post userId={userId} />
			</div>
		</>
	);
}
