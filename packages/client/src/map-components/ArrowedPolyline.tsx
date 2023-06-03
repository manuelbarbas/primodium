import React, { useEffect } from "react";
import { useLeafletContext } from "@react-leaflet/core";
import L, { PolylineOptions, LatLngLiteral } from "leaflet";
import { PolylineProps } from "react-leaflet";

type ArrowedPolylineProps = Omit<PolylineProps, "positions"> & {
  positions: [number, number][];
  arrowsPerSegment?: number;
};

const ArrowedPolyline: React.FC<ArrowedPolylineProps> = ({
  positions,
  arrowsPerSegment = 3,
  pathOptions,
}) => {
  const context = useLeafletContext();

  const positionsLatLngLiteral: LatLngLiteral[] = positions.map(
    ([lat, lng]) => ({ lat, lng })
  );

  useEffect(() => {
    const map = context.map;
    if (!map) {
      return;
    }

    const polyline = L.polyline(
      positionsLatLngLiteral,
      pathOptions as PolylineOptions
    );
    polyline.addTo(map);

    const markers: L.Marker[] = []; // Store the markers

    for (let i = 0; i < positionsLatLngLiteral.length - 1; i++) {
      const p1 = positionsLatLngLiteral[i];
      const p2 = positionsLatLngLiteral[i + 1];

      // Calculate rotation angle
      const dx = p2.lng - p1.lng;
      const dy = p2.lat - p1.lat;
      const rotation = (-Math.atan2(dy, dx) * 180) / Math.PI + 90;

      for (let j = 0; j < arrowsPerSegment; j++) {
        const t = (j + 1) / (arrowsPerSegment + 1);

        // Calculate intermediate point
        const intermediatePoint: LatLngLiteral = {
          lat: p1.lat + t * (p2.lat - p1.lat),
          lng: p1.lng + t * (p2.lng - p1.lng),
        };

        // Create arrow icon
        const arrowIcon = L.divIcon({
          className: "arrow-icon",
          iconSize: [24, 24],
          html: `<div style="width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 24px solid cyan; transform: rotate(${rotation}deg);"></div>`,
        });

        // Add arrow marker to map and store it in markers array
        const marker = L.marker(intermediatePoint, { icon: arrowIcon });
        marker.addTo(map);
        markers.push(marker);
      }
    }

    // Cleanup function
    return () => {
      map.removeLayer(polyline);
      markers.forEach((marker) => map.removeLayer(marker)); // Remove all arrow markers from the map
    };
  }, [context, positionsLatLngLiteral, arrowsPerSegment, pathOptions]);

  return null;
};

export default ArrowedPolyline;
