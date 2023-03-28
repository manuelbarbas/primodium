import { useState, useCallback, useEffect, useRef } from "react";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { SingletonID } from "@latticexyz/network";
import { Coord } from "../util/types";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { getTopLayerKeyPair } from "../util/tile";

import ResourceTileLayer from "../map-components/ResourceTileLayer";

export default function LeafletMapDebug() {
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

  return (
    <MapContainer
      center={[0, 0]}
      minZoom={4}
      maxZoom={6}
      zoom={6}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={false}
      preferCanvas={true}
      crs={L.CRS.Simple}
    >
      <LayersControl position="bottomleft">
        <ResourceTileLayer getTileKey={getTopLayerKeyPairHelper} />
      </LayersControl>
    </MapContainer>
  );
}
