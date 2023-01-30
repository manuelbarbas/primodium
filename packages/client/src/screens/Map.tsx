import { useState, useCallback, useEffect, useRef } from "react";
import { TxQueue } from "@latticexyz/network";

import { World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { getTerrainNormalizedDepth, getTerrainKey } from "../util/tile";
import { BlockColors } from "../util/constants";

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

  const getTerrainNoramalizedDepthHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return 0;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTerrainNormalizedDepth(coord, perlin);
      } else {
        return 0;
      }
    },
    [initialized]
  );

  const getTerrainColorHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return "#ffffff";
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTerrainKey(coord, perlin);
      } else {
        return "#fffff";
      }
    },
    [initialized]
  );

  // React Window
  const { height, width } = useWindowDimensions();
  const DISPLAY_GRID_SIZE = 16;
  const DISPLAY_TILES_PER_AXIS = 512;

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

    // Calculate tile perlin result
    const depth = getTerrainNoramalizedDepthHelper({ x: plotX, y: plotY });
    const color = getTerrainColorHelper({ x: plotX, y: plotY });

    return (
      <div
        style={{
          fontSize: 3,
          backgroundColor: BlockColors.get(color),
          ...style,
        }}
      >
        {plotX},{plotY}
        <br />
        {Math.round(depth * 100 * 100) / 100}
        <br />
      </div>
    );
  };

  const TileMap = () => (
    <Grid
      columnCount={DISPLAY_TILES_PER_AXIS}
      columnWidth={DISPLAY_GRID_SIZE}
      rowCount={DISPLAY_TILES_PER_AXIS}
      rowHeight={DISPLAY_GRID_SIZE}
      width={width}
      height={height * 0.96}
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
