import { useState, useCallback, useEffect, useRef } from "react";
import { TxQueue } from "@latticexyz/network";

import { Has, HasValue, World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { EntityID } from "@latticexyz/recs";
import { GodID as SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { BigNumber } from "ethers";
import { getTopLayerKey } from "../util/tile";

import { components } from "..";
import ResourceTileLayer from "../mapComponents/ResourceTileLayer";

import { DisplayTile } from "../util/constants";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

// Read the terrain state of the current coordinate
export default function LeafletMap({ systems }: Props) {
  const [initialized, setInitialized] = useState(false);
  const [selectedTile, setSelectedTile] = useState({
    x: null,
    y: null,
  } as DisplayTile);

  const executeTileAction = useCallback((x: number, y: number) => {
    console.log(x, y);
  }, []);

  // See that the tile has changed
  useEffect(() => {
    console.log("Here is the map, tile changed.");
    console.log(selectedTile);
  }, [selectedTile]);

  // Conveyer have steps 1 (place start), 2 (place end and executeTyped)
  const [startPathTile, setStartPathTile] = useState({
    x: null,
    y: null,
  } as DisplayTile);

  const [endPathTile, setEndPathTile] = useState({
    x: null,
    y: null,
  } as DisplayTile);

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

  // Place action
  const buildTile = useCallback((x: number, y: number, blockType: EntityID) => {
    systems["system.Build"].executeTyped(
      BigNumber.from(blockType),
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 1_000_000,
      }
    );
  }, []);

  const destroyTile = useCallback((x: number, y: number) => {
    systems["system.Destroy"].executeTyped(
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 1_000_000,
      }
    );
  }, []);

  // Select tile to start path, store in state
  const startPath = useCallback((x: number, y: number) => {
    setStartPathTile({
      x: x,
      y: y,
    });
  }, []);

  // Select tile to end path, executeTyped
  const endPath = useCallback((x: number, y: number) => {
    setEndPathTile({
      x: x,
      y: y,
    });
    if (startPathTile.x !== null && startPathTile.y !== null) {
      systems["system.BuildPath"].executeTyped(
        {
          x: startPathTile.x,
          y: startPathTile.y,
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
      <LayersControl position="bottomleft">
        <ResourceTileLayer
          getTileKey={getTopLayerKeyHelper}
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
        />
      </LayersControl>
    </MapContainer>
  );
}
