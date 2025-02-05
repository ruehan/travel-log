import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Map, { links as mapLinks } from "~/components/Map";
import { getImagesData } from "~/utils/images";

// 환경 변수를 클라이언트로 전달하기 위한 loader
export const loader: LoaderFunction = async () => {
	const imagesData = await getImagesData();
	console.log(imagesData);
	return json({
		mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
		images: imagesData,
	});
};

export const links: LinksFunction = () => [...mapLinks()];

export default function Index() {
	const { mapboxToken, images } = useLoaderData<typeof loader>();

	return (
		<div>
			<Map
				accessToken={mapboxToken}
				initialConfig={{
					center: [126.978, 37.5665],
					zoom: 3,
					style: "mapbox://styles/mapbox/streets-v12",
				}}
				markers={images}
			/>
		</div>
	);
}
