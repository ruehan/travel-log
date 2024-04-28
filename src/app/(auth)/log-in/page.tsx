"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { LogIn } from "./actions";
import Image from "next/image";

export default function CreateAccount() {
	const [state, dispatch] = useFormState(LogIn, null);

	return (
		<div className="flex flex-col gap-10 py-8 px-6 items-center relative h-screen">
			<div className="top-20 w-fit h-fit flex flex-col justify-center items-center gap-4">
				<Image
					src="https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/4b73fe3b-f640-4626-6f7e-d4425e7e6100/public"
					width={300}
					height={300}
					alt="Logo"
				/>
				<div className="text-5xl font-bold mt-[-10px]">TRAVEL LOG</div>
			</div>
			<form
				action={dispatch}
				className="flex flex-col gap-3  bottom-10 h-fit w-[20%] min-w-[200px] justify-center items-center"
			>
				<div className="flex flex-col gap-3 w-full">
					<input
						name="username"
						className="bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-md w-full h-10  placeholder:text-[#5a503f] p-4"
						type="text"
						placeholder="Username"
						required
					/>
					<p className="text-xs text-red-500">{state?.fieldErrors.username}</p>
					{/* <span className="text-red-500 font-medium">Input error</span> */}

					<input
						name="password"
						className="bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-md w-full h-10  placeholder:text-[#5a503f] p-4"
						type="password"
						placeholder="Password"
						required
					/>
					<p className="text-xs text-red-500">{state?.fieldErrors.password}</p>
				</div>
				<button className="primary-btn mt-4  bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-3xl p-2 w-full">
					LogIn
				</button>
				<span>OR</span>
				<button
					disabled
					className="primary-btn  bg-[#dcc9ae] border-2 border-[#5a503f] text-[#5a503f] rounded-3xl p-2 w-full"
				>
					Continue with Github
				</button>
			</form>
		</div>
	);
}
