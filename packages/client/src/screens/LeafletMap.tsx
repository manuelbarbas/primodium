import { useState, useCallback, useEffect, useRef } from "react";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { GodID as SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { getTopLayerKey } from "../util/tile";

import ResourceTileLayer from "../map-components/ResourceTileLayer";

import { useMud } from "../context/MudContext";
import { useSelectedTile } from "../context/SelectedTileContext";

// Read the terrain state of the current coordinate
export default function LeafletMap() {
  const { systems } = useMud();

  const {
    selectedStartPathTile,
    setSelectedStartPathTile,
    setSelectedEndPathTile,
  } = useSelectedTile();

  const [initialized, setInitialized] = useState(false);

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

  // Select tile to start path, store in state
  const startPath = useCallback((x: number, y: number) => {
    setSelectedStartPathTile({
      x: x,
      y: y,
    });
  }, []);

  // Select tile to end path, executeTyped
  const endPath = useCallback((x: number, y: number) => {
    setSelectedEndPathTile({
      x: x,
      y: y,
    });
    if (selectedStartPathTile.x !== null && selectedStartPathTile.y !== null) {
      systems["system.BuildPath"].executeTyped(
        {
          x: selectedStartPathTile.x,
          y: selectedStartPathTile.y,
        },
        {
          x: x,
          y: y,
        },

        {
          gasLimit: 1_000_000,
        }
      );
    }
  }, []);

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
      <LayersControl position="bottomright">
        <ResourceTileLayer getTileKey={getTopLayerKeyHelper} />
      </LayersControl>
    </MapContainer>
  );
}
