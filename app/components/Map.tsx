import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { Map as MapboxMap } from "mapbox-gl";
import { analyzeCoordinateClusters } from "~/utils/clustering";

export const links = () => [
	{ rel: "stylesheet", href: "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" },
];

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

const REGION_COLORS: { [key: string]: string } = {
	London: "#51bbd6",
	Barcelona: "#f28cb1",
	Paris: "#f1f075",
	"Disneyland Paris": "#ff69b4",
	Dijon: "#9370db",
	"Jungfrau Region": "#00b4ff", // 융프라우 지역은 하늘색 계열로 설정
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

		const createMarkers = () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];

			validMarkers.forEach((marker) => {
				if (marker.coordinates) {
					const el = document.createElement("div");
					el.className = "custom-marker";

					const img = document.createElement("img");
					img.src = `/img/${marker.filename}`;
					img.style.width = "50px";
					img.style.height = "50px";
					img.style.borderRadius = "25px";
					img.style.border = "2px solid white";
					el.appendChild(img);

					const newMarker = new mapboxgl.Marker(el).setLngLat(marker.coordinates).setPopup(
						new mapboxgl.Popup({
							offset: 25,
						}).setHTML(`
								<img src="/img/${marker.filename}" style="width: 200px; height: auto;" />
								${marker.takenAt ? `<p>촬영일: ${new Date(marker.takenAt).toLocaleDateString()}</p>` : ""}
							`)
					);

					markersRef.current.push(newMarker);
				}
			});
		};

		const updateDisplay = () => {
			if (!map.current) return;

			const zoom = map.current.getZoom();
			console.log("Current zoom:", zoom);

			if (zoom >= 8) {
				map.current.setLayoutProperty("clusters", "visibility", "none");
				map.current.setLayoutProperty("cluster-count", "visibility", "none");

				markersRef.current.forEach((marker) => marker.addTo(map.current!));
			} else {
				map.current.setLayoutProperty("clusters", "visibility", "visible");
				map.current.setLayoutProperty("cluster-count", "visibility", "visible");

				markersRef.current.forEach((marker) => marker.remove());

				const clusters = analyzeCoordinateClusters(coordinates, zoom);
				const source = map.current.getSource("clusters") as mapboxgl.GeoJSONSource;
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
			}
		};

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
					"circle-color": [
						"case",
						["==", ["get", "region"], "London"],
						"#51bbd6",
						["==", ["get", "region"], "Barcelona"],
						"#f28cb1",
						["==", ["get", "region"], "Paris"],
						"#f1f075",
						["==", ["get", "region"], "Disneyland Paris"],
						"#ff69b4",
						["==", ["get", "region"], "Dijon"],
						"#9370db",
						["==", ["get", "region"], "Jungfrau Region"],
						"#00b4ff",
						"#666666",
					],
					"circle-radius": 25,
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

			createMarkers();

			updateDisplay();

			map.current.on("zoomend", updateDisplay);
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
