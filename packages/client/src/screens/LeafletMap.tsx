import { useState, useCallback, useEffect, useRef } from "react";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { getTopLayerKeyPair } from "../util/tile";

import ResourceTileLayer from "../map-components/ResourceTileLayer";
import MovingCirclePolyline from "../map-components/MovingCirclePolyline";

export default function LeafletMap() {
  const [initialized, setInitialized] = useState(false);

  const perlinRef = useRef(null as null | Perlin);

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  const getTopLayerKeyPairHelper = useCallback(
    (coord: Coord) => {
      const defaultPair = { terrain: SingletonID, resource: SingletonID };
      if (!initialized || perlinRef.current === null) {
        return defaultPair;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKeyPair(coord, perlin);
      } else {
        return defaultPair;
      }
    },
    [initialized]
  );

  if (!initialized) {
    return <p>Initializing...</p>;
  }

  const positions: [number, number][] = [
    [0, 0],
    [1, 2],
    [2, 5],
    [10, 10],
  ];

  return (
    <MapContainer
      center={[0, 0]}
      minZoom={5}
      maxZoom={8}
      zoom={6}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={false}
      preferCanvas={true}
      crs={L.CRS.Simple}
    >
      <LayersControl position="topleft">
        <ResourceTileLayer getTileKey={getTopLayerKeyPairHelper} />
        <MovingCirclePolyline
          positions={positions}
          circleRadius={1}
          circleColor="brown"
          lineColor="blue"
          duration={1000}
        />
      </LayersControl>
    </MapContainer>
  );
}
