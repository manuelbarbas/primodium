import React, { useEffect, useRef, useState } from "react";
import { Circle, Polyline, useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";

interface MovingCirclePolylineProps {
  positions: [number, number][];
  circleRadius?: number;
  circleColor?: string;
  circleSpeed?: number;
  lineColor?: string;
  duration: number;
  [x: string]: any;
}

const MovingCirclePolyline: React.FC<MovingCirclePolylineProps> = ({
  positions,
  circleRadius = 0.25,
  circleColor = "red",
  circleSpeed = 3,
  lineColor = "blue",
  duration,
  ...otherProps
}) => {
  const map = useMap();
  const [circlePosition, setCirclePosition] = useState<[number, number]>(
    positions[0]
  );
  const currentIndex = useRef(0);
  const polylineRef = useRef<L.Polyline>();
  const circleRef = useRef<L.Circle>();

  const getPolylineLength = (): number => {
    let totalLength = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let from = new LatLng(positions[i][0], positions[i][1]);
      let to = new LatLng(positions[i + 1][0], positions[i + 1][1]);
      totalLength += from.distanceTo(to);
    }
    return totalLength;
  };

  const moveCircle = () => {
    let nextIndex = currentIndex.current + 1;

    // if move to the end move the circle to the start
    if (currentIndex.current + 1 === positions.length) {
      setCirclePosition(positions[0]);
      currentIndex.current = 0;
      nextIndex = 1;
    }

    let from = new LatLng(
      positions[currentIndex.current][0],
      positions[currentIndex.current][1]
    );
    let to = new LatLng(positions[nextIndex][0], positions[nextIndex][1]);

    // get segment length as a percentage of the total polyline length
    let segmentLength = from.distanceTo(to) / getPolylineLength();

    const startTime = performance.now();
    const move = (timestamp: number) => {
      // time should move faster if the segment is shorter
      // and slower if the segment is longer
      const elapsedTime = timestamp - startTime;
      const normalizedElapsedTime = elapsedTime / segmentLength / circleSpeed;
      const progress = Math.min(normalizedElapsedTime / duration, 1);
      console.log(progress);
      // console.log(duration);

      const lat = from.lat + (to.lat - from.lat) * progress;
      const lng = from.lng + (to.lng - from.lng) * progress;
      setCirclePosition([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(move);
      } else {
        currentIndex.current = nextIndex;
        moveCircle();
      }
    };

    requestAnimationFrame(move);
  };

  useEffect(() => {
    moveCircle();

    return () => {
      if (polylineRef.current) map.removeLayer(polylineRef.current);
      if (circleRef.current) map.removeLayer(circleRef.current);
    };
  }, [positions, circleRadius, circleColor, lineColor, map]);

  return (
    <>
      <Polyline positions={positions} color={lineColor} {...otherProps} />
      <Circle
        center={circlePosition}
        radius={circleRadius}
        color={circleColor}
      />
    </>
  );
};

export default MovingCirclePolyline;
