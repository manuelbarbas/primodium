import React, { useEffect, useRef, useState } from "react";
import { Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface MovingCirclePolylineProps {
  positions: [number, number][];
  circleRadius: number;
  circleColor?: string;
  lineColor?: string;
  duration: number;
  [x: string]: any;
}

const MovingCirclePolyline: React.FC<MovingCirclePolylineProps> = ({
  positions,
  circleRadius,
  circleColor = "red",
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

  const moveCircle = () => {
    const nextIndex = (currentIndex.current + 1) % positions.length;
    const from = positions[currentIndex.current];
    const to = positions[nextIndex];

    const startTime = performance.now();
    const move = (timestamp: number) => {
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const lat = from[0] + (to[0] - from[0]) * progress;
      const lng = from[1] + (to[1] - from[1]) * progress;
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
    polylineRef.current = L.polyline(positions, { color: lineColor }).addTo(
      map
    );
    circleRef.current = L.circle(circlePosition, {
      radius: circleRadius,
      color: circleColor,
    }).addTo(map);
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
