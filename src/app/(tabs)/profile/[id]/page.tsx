import getSession from "@/app/lib/session";
import { getFollowing, getPost, getUser, logOut } from "./actions";
import Link from "next/link";

async function User({ userId }: { userId: number }) {
	const user = await getUser(userId);
	const follow = await getFollowing(userId);
	const session = await getSession();

	return (
		<>
			<div className="flex justify-around w-full h-fit mt-8">
				<div className="flex flex-col items-center justify-center">
					<div className="font-bold text-lg">{user?.follow.length}</div>
					<div className="text-xs">follower</div>
				</div>
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
				<div className="flex flex-col items-center justify-center">
					<div className="font-bold text-lg">{follow.length}</div>
					<div className="text-xs">following</div>
				</div>
			</div>
			{session.id === user?.id && (
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
					href={`/post/${p.id}`}
					className="size-[100%] flex justify-center items-center bg-[#ddc8ae]"
				>
					{p.images[0].url !==
					"https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg//public" ? (
						<img src={p.images[0].url}></img>
					) : (
						<div className="text-xs">{p.content}</div>
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