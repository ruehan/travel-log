import db from "@/app/lib/db";
import getSession from "@/app/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import moment from "moment";

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
		},
	});

	return post;
}

async function Post() {
	const post = await getPost();
	return (
		<div className="w-[40%] h-screen pb-[100px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center  border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
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
					<img src={p.images[0].url} className="w-[90%] mt-4"></img>

					<div className="mt-4 flex justify-start w-[90%]">{p.content}</div>
					<div className="mt-4 flex justify-start w-[90%] text-xs">
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
		<Suspense fallback={"Loading"}>
			<Post />
		</Suspense>
	);
}
