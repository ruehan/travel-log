import db from "@/app/lib/db";
import { getFollower } from "../../profile/[id]/actions";
import Link from "next/link";

export async function getUserData(f_user: number[]) {
	const user = await db.user.findMany({
		where: {
			id: {
				in: f_user,
			},
		},
	});

	return user;
}

export default async function Follower({ params }: { params: { id: string } }) {
	const userId = Number(params.id);
	const follower = await getFollower(userId);
	console.log(follower);
	const f_user: number[] = [];
	follower.forEach((f) => {
		f_user.push(f.userId);
	});

	const user = await getUserData(f_user);

	return (
		<div className="w-[40%] h-screen pb-[100px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center p-4 border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5] gap-4 pt-8">
			<div className="font-bold text-lg ">Follower</div>
			<Link
				href={`/profile/${userId}`}
				className="size-fit p-2 border-2 border-[#786657] bg-[#ddc8ae] rounded-2xl"
			>
				뒤로가기
			</Link>
			<div className="w-full flex flex-col items-start h-fit gap-4">
				{user?.map((u) => (
					<Link
						key={u.id}
						href={`/profile/${u.id}`}
						className="flex items-center justify-center w-fit gap-4 relative border-2 border-[#786657] px-4 py-2 bg-[#fffcf4] rounded-xl"
					>
						<div
							className="size-[50px] border-2 border-[#786657] rounded-full "
							style={{
								backgroundImage: `url(${u.avatar})`,
								backgroundSize: "cover",
							}}
						></div>
						<div className="flex flex-col">
							<div className="font-bold">{u.username}</div>
							<div className="text-xs">{u.email}</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
