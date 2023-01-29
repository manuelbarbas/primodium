import { useState, useCallback, useEffect, useRef } from "react";
import { TxQueue } from "@latticexyz/network";

import { World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { getTerrainTile, getTerrainDepth } from "../util/tile";

import { FixedSizeGrid as Grid } from "react-window";
import useWindowDimensions from "../hooks/useWindowDimensions";

import { components } from "..";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

// Read the terrain state of the current coordinate
export default function Map({}: Props) {
  const [initialized, setInitialized] = useState(false);

  const perlinRef = useRef(null as null | Perlin);

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  const getTerrainTileHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return null;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTerrainTile(coord, perlin);
      } else {
        return null;
      }
    },
    [initialized]
  );

  const getTerrainDepthHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return null;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTerrainDepth(coord, perlin);
      } else {
        return null;
      }
    },
    [initialized]
  );

  // React Window
  const { height, width } = useWindowDimensions();
  const DISPLAY_GRID_SIZE = 64;
  const DISPLAY_TILES_PER_AXIS = 40;

  const displayIndexToTileIndex = (index: number) =>
    index - Math.round(DISPLAY_TILES_PER_AXIS * 0.5);

  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const plotX = displayIndexToTileIndex(columnIndex);
    const plotY = displayIndexToTileIndex(rowIndex);

    if (plotX === 0 && plotY === 0) {
      // Demo state of center tile
      return (
        <div
          style={{
            fontSize: 12,
            ...style,
          }}
        >
          <b>
            {plotX},{plotY}
          </b>
        </div>
      );
    } else {
      // Calculate tile perlin result
      const depth = getTerrainDepthHelper({ x: plotX, y: plotY });

      return (
        <div
          style={{
            fontSize: 6,
            ...style,
          }}
        >
          {plotX},{plotY}
          <br />
          {depth}
        </div>
      );
    }
  };

  const TileMap = () => (
    <Grid
      columnCount={DISPLAY_TILES_PER_AXIS}
      columnWidth={DISPLAY_GRID_SIZE}
      rowCount={DISPLAY_TILES_PER_AXIS}
      rowHeight={DISPLAY_GRID_SIZE}
      width={width}
      height={height * 0.9}
      initialScrollLeft={(DISPLAY_TILES_PER_AXIS * 0.5 - 4) * DISPLAY_GRID_SIZE}
      initialScrollTop={(DISPLAY_TILES_PER_AXIS * 0.5 - 4) * DISPLAY_GRID_SIZE}
    >
      {Cell}
    </Grid>
  );

  if (!initialized) {
    return <p>Initializing...</p>;
  }
  return (
    <>
      <p>Test Page</p>
      {/* {position ? position : "??"} */}
      <TileMap />
    </>
  );
}
