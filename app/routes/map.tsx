import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "../db.server";
import { convertDMSToDD } from "../utils/coordinates";
import React from "react";
import Map from "../components/Map";

export const loader: LoaderFunction = async () => {
	const photos = await db.photo.findMany({
		select: {
			id: true,
			imageUrl: true,
			latitudeDegrees: true,
			latitudeMinutes: true,
			latitudeSeconds: true,
			latitudeRef: true,
			longitudeDegrees: true,
			longitudeMinutes: true,
			longitudeSeconds: true,
			longitudeRef: true,
			title: true,
			takenAt: true,
		},
	});

	return json({
		mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
		photos: photos.map((photo) => ({
			lat: convertDMSToDD(photo.latitudeDegrees, photo.latitudeMinutes, photo.latitudeSeconds, photo.latitudeRef),
			lng: convertDMSToDD(photo.longitudeDegrees, photo.longitudeMinutes, photo.longitudeSeconds, photo.longitudeRef),
			title: photo.title,
			imageUrl: photo.imageUrl,
		})),
	});
};

export default function MapPage() {
	const { mapboxToken, photos } = useLoaderData<typeof loader>();

	return (
		<div className="h-screen">
			<Map
				accessToken={mapboxToken}
				markers={photos}
				initialConfig={{
					center: [126.978, 37.5665],
					zoom: 3,
				}}
			/>
		</div>
	);
}
