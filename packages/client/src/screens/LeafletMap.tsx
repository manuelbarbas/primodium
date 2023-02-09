import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  MouseEvent,
} from "react";
import { TxQueue } from "@latticexyz/network";

import { Has, HasValue, World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { FixedSizeGrid as Grid } from "react-window";
import { BigNumber } from "ethers";

import { singletonIndex } from "..";

import {
  // getTerrainNormalizedDepth,
  // getResourceNormalizedDepth,
  getTopLayerKey,
} from "../util/tile";
import { BlockColors } from "../util/constants";

import useWindowDimensions from "../hooks/useWindowDimensions";

import { components } from "..";

import { BlockType } from "../util/constants";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

// Read the terrain state of the current coordinate
export default function LeafletMap({ systems }: Props) {
  const [initialized, setInitialized] = useState(false);

  // Conveyer have steps 1 (place start), 2 (place end and executeTyped)
  const [startPathTile, setStartPathTile] = useState({
    x: null as null | number,
    y: null as null | number,
  });

  const [endPathTile, setEndPathTile] = useState({
    x: null as null | number,
    y: null as null | number,
  });

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
        return "#ffffff";
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKey(coord, perlin);
      } else {
        return "#fffff";
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
      systems["system.Path"].executeTyped(
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
    <>
      <p>hello leaflet</p>
    </>
  );
}
