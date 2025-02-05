import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { Map as MapboxMap } from "mapbox-gl";
import { analyzeCoordinateClusters } from "~/utils/clustering";

export const links = () => [{ rel: "stylesheet", href: "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" }];

interface MapProps {
	initialConfig?: {
		center?: [number, number];
		zoom?: number;
		style?: string;
	};
	accessToken: string;
	markers?: {
		filename: string;
		coordinates?: [number, number];
		takenAt?: Date;
	}[];
}

const REGION_COLORS = {
	UK: "#51bbd6",
	France: "#f1f075",
	Germany: "#f28cb1",
	unknown: "#666666",
};

export default function Map({ initialConfig, accessToken, markers }: MapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<MapboxMap | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	console.log(markers);

	useEffect(() => {
		if (!mapContainer.current) return;

		mapboxgl.accessToken = accessToken;
		const validMarkers = markers?.filter((m) => m.coordinates) || [];
		const coordinates = validMarkers.map((m) => m.coordinates!) as [number, number][];

		console.log("Initial coordinates:", coordinates);

		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: initialConfig?.style || "mapbox://styles/mapbox/streets-v12",
			center: initialConfig?.center || [126.978, 37.5665],
			zoom: initialConfig?.zoom || 12,
			localIdeographFontFamily: "'Noto Sans KR', sans-serif",
		});

		map.current.on("load", () => {
			console.log("Map loaded");

			map.current?.addSource("clusters", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [],
				},
			});

			map.current?.addLayer({
				id: "clusters",
				type: "circle",
				source: "clusters",
				filter: ["has", "point_count"],
				paint: {
					"circle-color": ["case", ["==", ["get", "region"], "London"], "#51bbd6", "#666666"],
					"circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 10, 40],
				},
			});

			map.current?.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "clusters",
				filter: ["has", "point_count"],
				layout: {
					"text-field": "{point_count}",
					"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
					"text-size": 14,
				},
				paint: {
					"text-color": "#ffffff",
				},
			});

			console.log("Starting initial cluster update");
			const initialZoom = map.current.getZoom();
			const initialClusters = analyzeCoordinateClusters(coordinates, initialZoom);
			console.log("Initial clusters:", initialClusters);

			const source = map.current.getSource("clusters") as mapboxgl.GeoJSONSource;
			if (source) {
				const geojson = {
					type: "FeatureCollection",
					features: initialClusters.map((cluster) => ({
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: cluster.center,
						},
						properties: {
							point_count: cluster.points.length,
							region: cluster.region,
						},
					})),
				};

				console.log("Setting initial GeoJSON:", geojson);
				source.setData(geojson as any);
			}

			// 줌 변경 이벤트 리스너
			map.current.on("zoomend", () => {
				const zoom = map.current?.getZoom() || 0;
				console.log("Zoom changed:", zoom);

				const clusters = analyzeCoordinateClusters(coordinates, zoom);
				console.log("Updated clusters:", clusters);

				const source = map.current?.getSource("clusters") as mapboxgl.GeoJSONSource;
				if (source) {
					source.setData({
						type: "FeatureCollection",
						features: clusters.map((cluster) => ({
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: cluster.center,
							},
							properties: {
								point_count: cluster.points.length,
								region: cluster.region,
							},
						})),
					} as any);
				}
			});
		});

		// 컴포넌트 언마운트 시 지도 제거
		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			map.current?.remove();
		};
	}, [initialConfig, accessToken, markers]);

	return (
		<>
			<style>
				{`
					.custom-marker {
						background: transparent;
						cursor: pointer;
					}
					.custom-marker img:hover {
						transform: scale(1.1);
						transition: transform 0.2s;
					}
					.mapboxgl-popup-content {
						padding: 15px;
						border-radius: 8px;
					}
				`}
			</style>
			<div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
		</>
	);
}
