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
	markers?: {
		filename: string;
		coordinates?: [number, number];
		takenAt?: Date;
	}[];
}

export default function Map({ initialConfig, accessToken, markers }: MapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<MapboxMap | null>(null);

	console.log(markers);

	useEffect(() => {
		if (!mapContainer.current) return;

		mapboxgl.accessToken = accessToken;

		// 지도 초기화
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: initialConfig?.style || "mapbox://styles/mapbox/streets-v12",
			center: initialConfig?.center || [126.978, 37.5665], // 서울 좌표
			zoom: initialConfig?.zoom || 12,
			localIdeographFontFamily: "'Noto Sans KR', sans-serif",
		});

		map.current.on("load", () => {
			// 모든 레이블 레이어를 한글로 변경
			const koreanLabelLayers = [
				"country-label", // 국가명
				"state-label", // 도/시 이름
				"settlement-label", // 도시/마을 이름
				"settlement-subdivision-label", // 구/동 이름
				"poi-label", // 주요 시설물
				"airport-label", // 공항
				"natural-point-label", // 자연 지형
				"water-point-label", // 수계 지형
				"road-label", // 도로명
				"waterway-label", // 수로명
			];

			koreanLabelLayers.forEach((layerId) => {
				if (map.current?.getLayer(layerId)) {
					map.current?.setLayoutProperty(layerId, "text-field", ["coalesce", ["get", "name_ko"], ["get", "name"]]);
				}
			});

			// 마커 추가
			markers?.forEach((marker) => {
				if (marker.coordinates) {
					// 커스텀 마커 엘리먼트 생성
					const el = document.createElement("div");
					el.className = "custom-marker";

					// 이미지 엘리먼트 생성
					const img = document.createElement("img");
					img.src = `/img/${marker.filename}`;
					img.style.width = "50px";
					img.style.height = "50px";
					img.style.borderRadius = "50%";
					img.style.border = "3px solid white";
					img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
					img.style.cursor = "pointer";

					el.appendChild(img);

					// 마커 생성 및 추가
					new mapboxgl.Marker(el)
						.setLngLat(marker.coordinates)
						.setPopup(
							new mapboxgl.Popup({
								offset: 25,
							}).setHTML(`
								<img src="/img/${marker.filename}" style="width: 200px; height: auto;" />
								${marker.takenAt ? `<p>촬영일: ${new Date(marker.takenAt).toLocaleDateString()}</p>` : ""}
							`)
						)
						.addTo(map.current!);
				}
			});
		});

		// 컴포넌트 언마운트 시 지도 제거
		return () => {
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
