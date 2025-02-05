import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { Map as MapboxMap } from "mapbox-gl";

// CSS import를 위한 links 함수 추가가 필요합니다
export const links = () => [{ rel: "stylesheet", href: "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" }];

interface MapProps {
	initialConfig?: {
		center?: [number, number];
		zoom?: number;
		style?: string;
	};
	accessToken: string;
}

export default function Map({ initialConfig, accessToken }: MapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<MapboxMap | null>(null);

	useEffect(() => {
		if (!mapContainer.current) return;

		mapboxgl.accessToken = accessToken;

		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: initialConfig?.style || "mapbox://styles/mapbox/streets-v12",
			center: initialConfig?.center || [126.978, 37.5665],
			zoom: initialConfig?.zoom || 12,
			localIdeographFontFamily: "'Noto Sans KR', sans-serif",
		});

		map.current.on("load", () => {
			const koreanLabelLayers = [
				"country-label",
				"state-label",
				"settlement-label",
				"settlement-subdivision-label",
				"poi-label",
				"airport-label",
				"natural-point-label",
				"water-point-label",
				"road-label",
				"waterway-label",
			];

			koreanLabelLayers.forEach((layerId) => {
				if (map.current?.getLayer(layerId)) {
					map.current?.setLayoutProperty(layerId, "text-field", ["coalesce", ["get", "name_ko"], ["get", "name"]]);
				}
			});
		});

		// 컴포넌트 언마운트 시 지도 제거
		return () => {
			map.current?.remove();
		};
	}, [initialConfig]);

	return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
