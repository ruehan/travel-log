import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Map, { links as mapLinks } from "~/components/Map";

export const loader: LoaderFunction = async () => {
	return json({
		mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
	});
};

export const links: LinksFunction = () => [...mapLinks()];

export default function Index() {
	const { mapboxToken } = useLoaderData<typeof loader>();

	return (
		<div>
			<Map
				accessToken={mapboxToken}
				initialConfig={{
					center: [126.978, 37.5665],
					zoom: 12,
					style: "mapbox://styles/mapbox/streets-v12",
				}}
			/>
		</div>
	);
}
