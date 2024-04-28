export default function Loading() {
	return (
		<div className="w-[40%] animate-pulse  h-screen pb-[80px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center  border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
			<div className="flex justify-around w-full h-fit mt-8">
				<div className="flex flex-col items-center justify-center">
					<div className="font-bold text-lg size-[20px] bg-neutral-700"></div>
					<div className="text-xs">follower</div>
				</div>
				<div className="flex flex-col items-center justify-center gap-4">
					<div className="size-[100px] rounded-full bg-neutral-700"></div>
					<div className="w-[100px] h-[15px] font-bold text-lg bg-neutral-700"></div>
					<div className="w-[150px] h-[10px] text-xs bg-neutral-700"></div>
				</div>
				<div className="flex flex-col items-center justify-center">
					<div className="font-bold text-lg size-[20px] bg-neutral-700"></div>
					<div className="text-xs">following</div>
				</div>
			</div>
		</div>
	);
}
