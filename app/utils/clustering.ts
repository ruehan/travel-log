interface GeoRegion {
	name: string;
	bounds: {
		north: number;
		south: number;
		east: number;
		west: number;
	};
}

// 주요 유럽 지역 정의
const REGIONS: GeoRegion[] = [
	{
		name: "London",
		bounds: {
			north: 51.6723, // 런던 광역권 북쪽 경계
			south: 51.2867, // 런던 광역권 남쪽 경계
			east: 0.334, // 런던 광역권 동쪽 경계
			west: -0.5103, // 런던 광역권 서쪽 경계
		},
	},
];

// 좌표가 어느 지역에 속하는지 확인하는 함수
function getRegionForCoordinate(coord: [number, number]): string {
	const [lon, lat] = coord;

	for (const region of REGIONS) {
		if (lat <= region.bounds.north && lat >= region.bounds.south && lon <= region.bounds.east && lon >= region.bounds.west) {
			return region.name;
		}
	}

	// 런던 이외 지역은 각각 다른 지역으로 처리
	// 각 좌표를 고유한 지역으로 취급하여 클러스터링 방지
	return `other-${lon.toFixed(3)}-${lat.toFixed(3)}`;
}

// 지역별로 좌표들을 그룹화하는 함수
function groupCoordinatesByRegion(coordinates: [number, number][]): Map<string, [number, number][]> {
	const groups = new Map<string, [number, number][]>();

	coordinates.forEach((coord) => {
		const region = getRegionForCoordinate(coord);
		if (!groups.has(region)) {
			groups.set(region, []);
		}
		groups.get(region)!.push(coord);
	});

	return groups;
}

// 수정된 메인 클러스터링 함수
export function analyzeCoordinateClusters(coordinates: [number, number][], zoom: number): Cluster[] {
	if (coordinates.length === 0) return [];

	// 디버깅을 위한 로그
	console.log("Starting clustering with coordinates:", coordinates);

	// 지역별로 좌표 그룹화
	const regionGroups = groupCoordinatesByRegion(coordinates);
	console.log("Region groups:", regionGroups);

	let allClusters: Cluster[] = [];

	// 각 지역별로 별도 클러스터링 수행
	regionGroups.forEach((regionCoordinates, regionName) => {
		console.log(`Processing region: ${regionName} with ${regionCoordinates.length} points`);

		let clusters = regionCoordinates.map((coord) => ({
			center: coord,
			points: [coord],
			radius: 0,
			region: regionName,
		}));

		// 같은 지역 내에서만 클러스터 병합
		let merged = true;
		while (merged) {
			merged = false;
			const newClusters: Cluster[] = [];
			const usedIndices = new Set<number>();

			for (let i = 0; i < clusters.length; i++) {
				if (usedIndices.has(i)) continue;

				let currentCluster = clusters[i];
				usedIndices.add(i);

				for (let j = i + 1; j < clusters.length; j++) {
					if (usedIndices.has(j)) continue;

					if (shouldMergeClusters(currentCluster, clusters[j], zoom)) {
						currentCluster = mergeClusters(currentCluster, clusters[j]);
						usedIndices.add(j);
						merged = true;
					}
				}

				newClusters.push(currentCluster);
			}

			clusters = newClusters;
		}

		allClusters = allClusters.concat(clusters);
	});

	console.log("Final clusters:", allClusters);
	return allClusters;
}

// 클러스터 타입에 지역 정보 추가
interface Cluster {
	center: [number, number];
	points: [number, number][];
	radius: number;
	region: string;
}

// 두 클러스터를 병합해야 하는지 판단하는 함수
function shouldMergeClusters(currentCluster: Cluster, targetCluster: Cluster, zoom: number): boolean {
	// 같은 지역인지 확인
	if (currentCluster.region !== targetCluster.region) {
		return false;
	}

	const [lon1, lat1] = currentCluster.center;
	const [lon2, lat2] = targetCluster.center;

	// 두 클러스터 간의 거리 계산
	const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));

	// 줌 레벨에 따른 최대 병합 거리 계산
	const maxDistance = Math.max(0.5, 10 * Math.pow(0.4, zoom / 4));

	// 포인트 수에 따른 가중치 적용
	const pointsWeight = Math.log(currentCluster.points.length + targetCluster.points.length) / Math.log(2);
	const adjustedMaxDistance = maxDistance * (1 + pointsWeight * 0.5);

	return distance < adjustedMaxDistance;
}

// 두 클러스터를 병합하는 함수
function mergeClusters(cluster1: Cluster, cluster2: Cluster): Cluster {
	const allPoints = [...cluster1.points, ...cluster2.points];

	// 포인트 수에 따른 가중 평균으로 새로운 중심점 계산
	const weight1 = cluster1.points.length;
	const weight2 = cluster2.points.length;
	const totalWeight = weight1 + weight2;

	const avgLon = (cluster1.center[0] * weight1 + cluster2.center[0] * weight2) / totalWeight;
	const avgLat = (cluster1.center[1] * weight1 + cluster2.center[1] * weight2) / totalWeight;

	// 새로운 반경 계산 (두 클러스터를 포함할 수 있는 최소 반경)
	const newRadius = Math.max(
		cluster1.radius,
		cluster2.radius,
		Math.sqrt(Math.pow(avgLon - cluster1.center[0], 2) + Math.pow(avgLat - cluster1.center[1], 2)) + cluster1.radius,
		Math.sqrt(Math.pow(avgLon - cluster2.center[0], 2) + Math.pow(avgLat - cluster2.center[1], 2)) + cluster2.radius
	);

	return {
		center: [avgLon, avgLat],
		points: allPoints,
		radius: newRadius,
		region: cluster1.region, // 지역 정보 유지
	};
}
