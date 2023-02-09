import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
  MouseEvent,
} from "react";
import { TxQueue } from "@latticexyz/network";

import { Has, HasValue, World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { EntityID } from "@latticexyz/recs";
import { GodID as SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { FixedSizeGrid as Grid } from "react-window";
import {
  MapContainer,
  TileLayer,
  LayerGroup,
  Rectangle,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";

import { BigNumber } from "ethers";

import { singletonIndex } from "..";

import { getTopLayerKey } from "../util/tile";
import { BlockColors } from "../util/constants";

import useWindowDimensions from "../hooks/useWindowDimensions";

import { components } from "..";

import { BlockType } from "../util/constants";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

const TILE_SIZE: number = 16;
const SCALE_FACTOR: number = 16;

const PlotsGridLayer = memo(
  ({
    getTopLayerKeyHelper,
  }: {
    getTopLayerKeyHelper: (coord: Coord) => EntityID;
  }) => {
    const map = useMap();

    const [tileRange, setTileRange] = useState({
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
    });

    const setNewBounds = () => {
      const bounds = map.getBounds();
      const newTileRange = {
        x1: Math.floor(bounds.getWest()),
        x2: Math.ceil(bounds.getEast()),
        y1: Math.floor(bounds.getSouth()),
        y2: Math.ceil(bounds.getNorth()),
      };
      setTileRange(newTileRange);

      console.log("Get new bounds");
      console.log(newTileRange);
    };

    useEffect(setNewBounds, [map]);
    useMapEvent("moveend", setNewBounds);

    let [plots, setPlots] = useState<JSX.Element[]>([]);

    useEffect(() => {
      if (!map) return;

      let toRender = [];

      for (let i = tileRange.x1; i < tileRange.x2; i += 1) {
        for (let j = tileRange.y1; j < tileRange.y2; j += 1) {
          const currentCoord = { x: i, y: j };
          const topLayerKey = getTopLayerKeyHelper({
            x: i,
            y: j,
          });

          const weight = 1;

          toRender.push(
            <Rectangle
              key={JSON.stringify(currentCoord)}
              bounds={[
                [currentCoord.y, currentCoord.x],
                [
                  currentCoord.y + TILE_SIZE / SCALE_FACTOR,
                  currentCoord.x + TILE_SIZE / SCALE_FACTOR,
                ],
              ]}
              pathOptions={{
                weight,
                color: BlockColors.get(topLayerKey as EntityID),
              }}
            />
          );
        }
      }

      setPlots(toRender);
    }, [tileRange]);

    return <LayerGroup>{plots}</LayerGroup>;
  }
);

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
    <MapContainer
      center={[0, 0]}
      minZoom={4}
      maxZoom={8}
      zoom={8}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={true}
      preferCanvas={true}
      crs={L.CRS.Simple}
    >
      <PlotsGridLayer getTopLayerKeyHelper={getTopLayerKeyHelper} />
    </MapContainer>
  );
}
