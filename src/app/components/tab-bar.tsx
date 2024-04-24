import Link from "next/link";

export default function TabBar() {
	return (
		<div className="w-[80%] h-16 border-2 border-[#6d635b] bg-[#fffcf4] fixed bottom-0 left-[50%] translate-x-[-50%] flex justify-around items-center rounded-t-2xl">
			<Link
				href="/"
				className="flex flex-col justify-center items-center gap-1"
				scroll={false}
			>
				<img
					className="w-[30px]"
					src="https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/4836368b-9fc8-457f-8492-f82db0417500/public"
				></img>
				<div className="text-sm">홈</div>
			</Link>
			<Link
				href="/create-post"
				className="flex flex-col justify-center items-center gap-1"
				scroll={false}
			>
				<img
					className="w-[30px]"
					src="https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/754c70dd-f1dd-4b80-2db2-807729d62400/public"
				></img>
				<div className="text-sm">게시물 작성</div>
			</Link>
			<Link
				href="/chat"
				className="flex flex-col justify-center items-center gap-1"
				scroll={false}
			>
				<img
					className="w-[30px]"
					src="https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/7d4a018d-e18e-4488-fa71-2fbab036f100/public"
				></img>
				<div className="text-sm">채팅</div>
			</Link>
			<Link
				href="/profile"
				className="flex flex-col justify-center items-center gap-1"
				scroll={false}
			>
				<img
					className="w-[30px]"
					src="https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/3d1db691-d4fa-4e88-4924-423ece0c1300/public"
				></img>
				<div className="text-sm">프로필</div>
			</Link>
		</div>
	);
}

// https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/e3076f91-f06c-471c-2ae5-4204577c8400/public
