import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Circle, Polyline, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";

interface MovingCirclePolylineProps {
  positions: [number, number][];
  pathOptions: L.PolylineOptions;
  circleRadius?: number;
  circleColor?: string;
  circleSpeed?: number;
  lineColor?: string;
  duration?: number;
  [x: string]: any;
}

const MovingCirclePolyline: React.FC<MovingCirclePolylineProps> = ({
  positions,
  pathOptions,
  circleRadius = 0.1,
  circleColor = "red",
  circleSpeed = 3,
  lineColor = "white",
  duration = 1000,
  ...otherProps
}) => {
  const map = useMap();
  const [circlePosition, setCirclePosition] = useState<[number, number]>(
    positions[0]
  );
  const currentIndex = useRef(0);
  const polylineRef = useRef<L.Polyline>();
  const circleRef = useRef<L.Circle>();
  const requestId = useRef<number | null>(null);

  const getPolylineLength = useCallback((): number => {
    let totalLength = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let from = new LatLng(positions[i][0], positions[i][1]);
      let to = new LatLng(positions[i + 1][0], positions[i + 1][1]);
      totalLength += from.distanceTo(to);
    }
    return totalLength;
  }, [positions]);

  const polylineLength = useMemo(() => getPolylineLength(), [positions]);

  const circlePathOptions = useMemo(
    () => ({
      fillOpacity: 1,
      weight: 1,
    }),
    []
  );

  const moveCircle = useCallback(() => {
    let nextIndex = currentIndex.current + 1;

    // if move to the end move the circle to the start
    if (currentIndex.current + 1 === positions.length) {
      setCirclePosition(positions[0]);
      currentIndex.current = 0;
      nextIndex = 1;
    }

    const from = new LatLng(
      positions[currentIndex.current][0],
      positions[currentIndex.current][1]
    );
    const to = new LatLng(positions[nextIndex][0], positions[nextIndex][1]);

    // get segment length as a percentage of the total polyline length
    if (polylineLength === 0) return;
    const segmentLength = from.distanceTo(to) / polylineLength;

    const startTime = performance.now();
    const move = (timestamp: number) => {
      // time should move faster if the segment is shorter
      // and slower if the segment is longer
      const elapsedTime = timestamp - startTime;
      const normalizedElapsedTime = elapsedTime / segmentLength / circleSpeed;
      const progress = Math.min(normalizedElapsedTime / duration, 1);

      const lat = from.lat + (to.lat - from.lat) * progress;
      const lng = from.lng + (to.lng - from.lng) * progress;

      if (isNaN(lat) || isNaN(lng)) return;

      setCirclePosition([lat, lng]);

      if (progress < 1) {
        requestId.current = requestAnimationFrame(move);
      } else {
        currentIndex.current = nextIndex;
        requestId.current = requestAnimationFrame(moveCircle);
      }
    };

    requestId.current = requestAnimationFrame(move);
  }, [positions, polylineLength, circleSpeed, duration]);

  useEffect(() => {
    moveCircle();

    return () => {
      if (requestId.current !== null) {
        cancelAnimationFrame(requestId.current);
      }
      if (polylineRef.current) map.removeLayer(polylineRef.current);
      if (circleRef.current) map.removeLayer(circleRef.current);
    };
  }, [positions, circleRadius, circleColor, lineColor, map, moveCircle]);

  return (
    <>
      <Polyline
        positions={positions}
        color={lineColor}
        pathOptions={pathOptions}
        {...otherProps}
      />
      <Circle
        center={circlePosition}
        radius={circleRadius}
        color={circleColor}
        pathOptions={circlePathOptions}
      />
    </>
  );
};

export default React.memo(MovingCirclePolyline);
