"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { createPost, getUploadUrl } from "./actions";

export default function CreatePost() {
	const [preview, setPreview] = useState("");
	const [imageId, setImageId] = useState("");
	const [uploadUrl, setUploadUrl] = useState("");

	const interceptAction = async (_: any, formData: FormData) => {
		const file = formData.get("photo");
		if (!file) {
			return;
		}
		const cloudflareForm = new FormData();
		cloudflareForm.append("file", file);
		const response = await fetch(uploadUrl, {
			method: "POST",
			body: cloudflareForm,
		});
		if (response.status !== 200) {
			return;
		}

		const photoUrl = `https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/${imageId}/public`;

		formData.set("photo", photoUrl);

		return createPost(_, formData);
	};
	const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const {
			target: { files },
		} = event;
		if (!files) {
			return;
		}
		const file = files[0];
		const url = URL.createObjectURL(file);
		setPreview(url);

		const { success, result } = await getUploadUrl();
		if (success) {
			const { id, uploadURL } = result;
			setUploadUrl(uploadURL);
			setImageId(id);
		}
	};

	const [state, dispatch] = useFormState(interceptAction, null);

	return (
		<form
			action={dispatch}
			className="w-[40%] h-screen pb-[100px] flex flex-col fixed left-[50%] translate-x-[-50%] items-center p-4 border-x-2 border-[#786657] overflow-scroll bg-[#eee6d5] gap-4 pt-8"
		>
			<label
				htmlFor="photo"
				className="border-2 size-[100%] aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer"
				style={{ backgroundImage: `url(${preview})`, backgroundSize: "cover" }}
			>
				{/* <PhotoIcon className="w-20" /> */}
				{preview === "" && (
					<div className="text-neutral-400 text-sm">사진을 추가해주세요.</div>
				)}
			</label>
			<input
				onChange={onImageChange}
				type="file"
				id="photo"
				name="photo"
				accept="image/*"
				className="hidden"
			/>

			<textarea
				name="content"
				className="w-full flex resize-none h-[100px]"
				required
				placeholder="자세한 설명"
			/>

			<button>작성 완료</button>
		</form>
	);
}
