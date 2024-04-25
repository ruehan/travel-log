import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";

async function getUser() {
	const session = await getSession();
	if (session.id) {
		const user = await db.user.findUnique({
			where: {
				id: session.id,
			},
			include: {
				follow: true,
			},
		});
		if (user) {
			console.log(user);
			return user;
		}
	} else {
		redirect("/create-account");
	}
}

async function getFollowing() {
	const session = await getSession();
	const following = await db.follow.findMany({
		where: {
			follow: session.id,
		},
	});

	return following;
}

async function getPost() {
	const session = await getSession();
	const post = await db.post.findMany({
		where: {
			userId: session.id,
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

async function User() {
	const user = await getUser();
	const follow = await getFollowing();
	return (
		<div className="flex justify-around w-full h-fit mt-4">
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
	);
}

async function Post() {
	const post = await getPost();
	return (
		<div className="w-full h-fit grid grid-cols-3 mt-10 gap-2 p-2">
			{post.map((p) => (
				<div className="size-[100%] flex justify-center items-center bg-[#ddc8ae]">
					<img src={p.images[0].url}></img>
				</div>
			))}
		</div>
	);
}

export default async function Profile() {
	return (
		<div className="w-[40%] h-screen pb-[80px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center  border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
			<User />
			<Post />
		</div>
	);
}