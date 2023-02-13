import { useState, useCallback, useEffect, useRef } from "react";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { GodID as SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { getTopLayerKey } from "../util/tile";

import ResourceTileLayer from "../map-components/ResourceTileLayer";

import { useSelectedTile } from "../context/SelectedTileContext";

// Read the terrain state of the current coordinate
export default function LeafletMapDebug() {
  const [initialized, setInitialized] = useState(false);

  const { selectedTile } = useSelectedTile();

  // See that the tile has changed
  useEffect(() => {
    console.log("Here is the map, tile changed.");
    console.log(selectedTile);
  }, [selectedTile]);

  const perlinRef = useRef(null as null | Perlin);

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  const getTopLayerKeyHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return SingletonID;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKey(coord, perlin);
      } else {
        return SingletonID;
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
        <ResourceTileLayer getTileKey={getTopLayerKeyHelper} />
      </LayersControl>
    </MapContainer>
  );
}
