import Link from "next/link";

export default function CreateAccount() {
	return (
		<div className="flex flex-col gap-10 py-8 px-6 items-center relative h-screen">
			<div className="absolute top-20 w-fit h-fit flex flex-col justify-center items-center gap-4">
				<img
					src="travelloglogo.png"
					style={{ width: "90%", margin: "-100px" }}
				></img>
				<div className="text-5xl font-bold">TRAVEL LOG</div>
			</div>
			<form className="flex flex-col gap-3 absolute bottom-20 h-fit">
				<div className="flex flex-col gap-2">
					<input
						className="bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-md w-full h-10  placeholder:text-[#5a503f] p-4"
						type="text"
						placeholder="Username"
						required
					/>
					<span className="text-red-500 font-medium">Input error</span>
					<input
						className="bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-md w-full h-10  placeholder:text-[#5a503f] p-4"
						type="text"
						placeholder="Password"
						required
					/>
				</div>
				<button className="primary-btn h-10">LogIn</button>
			</form>
		</div>
	);
}
