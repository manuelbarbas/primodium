// worker.ts
export function getPolylineLength(positions: [number, number][]): number {
  let totalLength = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    let from = { lat: positions[i][0], lng: positions[i][1] };
    let to = { lat: positions[i + 1][0], lng: positions[i + 1][1] };
    totalLength += Math.sqrt(
      Math.pow(from.lat - to.lat, 2) + Math.pow(from.lng - to.lng, 2)
    );
  }
  return totalLength;
}
