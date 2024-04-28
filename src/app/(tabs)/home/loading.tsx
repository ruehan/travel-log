export default function Loading() {
	return (
		<div className="w-[40%] animate-pulse  h-screen pb-[80px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center  border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5]">
			{[...Array(3)].map((_, index) => (
				<div className="w-full h-fit flex flex-col items-center mt-4 ">
					<div className="flex items-center justify-start w-[90%] gap-4">
						<div className="size-[50px] border-2 border-[#786657] rounded-full  bg-neutral-700"></div>
						<div className="flex flex-col gap-2">
							<div className="font-bold  bg-neutral-700 w-[100px] h-[15px]"></div>
							<div className="text-xs  bg-neutral-700 w-[100px] h-[15px]"></div>
						</div>
					</div>
					<div className="w-[90%] h-[500px] mt-4 bg-neutral-700"></div>

					<div className="mt-4 flex justify-start w-[90%]"></div>
					<div className="mt-4 flex justify-start w-[90%] text-xs"></div>
					<div className="w-full h-[2px] bg-[#786657] mt-4"></div>
				</div>
			))}
		</div>
	);
}
