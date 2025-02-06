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
			north: 51.6723,
			south: 51.2867,
			east: 0.334,
			west: -0.5103,
		},
	},
	{
		name: "Barcelona",
		bounds: {
			north: 41.49,
			south: 41.32,
			east: 2.23,
			west: 2.07,
		},
	},
	{
		name: "Paris",
		bounds: {
			north: 48.9021,
			south: 48.8156,
			east: 2.4699,
			west: 2.224,
		},
	},
	{
		name: "Disneyland Paris",
		bounds: {
			north: 48.88,
			south: 48.86,
			east: 3.79,
			west: 2.77,
		},
	},
	{
		name: "Dijon",
		bounds: {
			north: 47.35,
			south: 47.28,
			east: 5.07,
			west: 4.99,
		},
	},
	{
		name: "Jungfrau Region",
		bounds: {
			north: 46.7,
			south: 46.5,
			east: 8.2,
			west: 7.7,
		},
	},
];

function getRegionForCoordinate(coord: [number, number]): string {
	const [lon, lat] = coord;

	for (const region of REGIONS) {
		if (lat <= region.bounds.north && lat >= region.bounds.south && lon <= region.bounds.east && lon >= region.bounds.west) {
			return region.name;
		}
	}

	return `other-${lon.toFixed(3)}-${lat.toFixed(3)}`;
}

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

export function analyzeCoordinateClusters(coordinates: [number, number][], zoom: number): Cluster[] {
	if (coordinates.length === 0) return [];

	console.log("Starting clustering with coordinates:", coordinates);

	const regionGroups = groupCoordinatesByRegion(coordinates);
	console.log("Region groups:", regionGroups);

	let allClusters: Cluster[] = [];

	regionGroups.forEach((regionCoordinates, regionName) => {
		console.log(`Processing region: ${regionName} with ${regionCoordinates.length} points`);

		let clusters = regionCoordinates.map((coord) => ({
			center: coord,
			points: [coord],
			radius: 0,
			region: regionName,
		}));

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

interface Cluster {
	center: [number, number];
	points: [number, number][];
	radius: number;
	region: string;
}

function shouldMergeClusters(currentCluster: Cluster, targetCluster: Cluster, zoom: number): boolean {
	if (currentCluster.region !== targetCluster.region) {
		return false;
	}

	const [lon1, lat1] = currentCluster.center;
	const [lon2, lat2] = targetCluster.center;

	const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));

	const maxDistance = Math.max(0.5, 10 * Math.pow(0.4, zoom / 4));

	const pointsWeight = Math.log(currentCluster.points.length + targetCluster.points.length) / Math.log(2);
	const adjustedMaxDistance = maxDistance * (1 + pointsWeight * 0.5);

	return distance < adjustedMaxDistance;
}

function mergeClusters(cluster1: Cluster, cluster2: Cluster): Cluster {
	const allPoints = [...cluster1.points, ...cluster2.points];

	const weight1 = cluster1.points.length;
	const weight2 = cluster2.points.length;
	const totalWeight = weight1 + weight2;

	const avgLon = (cluster1.center[0] * weight1 + cluster2.center[0] * weight2) / totalWeight;
	const avgLat = (cluster1.center[1] * weight1 + cluster2.center[1] * weight2) / totalWeight;

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
		region: cluster1.region,
	};
}
