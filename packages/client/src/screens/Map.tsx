import { useEffect } from "react";
import { TxQueue } from "@latticexyz/network";
import { EntityIndex, World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { useComponentValue } from "@latticexyz/react";

import { FixedSizeGrid as Grid } from "react-window";
import useWindowDimensions from "../hooks/useWindowDimensions";

import { components } from "..";

// import { getBlockAtPosition, getTerrainBlock } from "../layers/network/api";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

// Read the terrain state of the current coordinate
export default function Map({ systems, components }: Props) {
  // MUD
  const position = useComponentValue(components.Position, 0 as EntityIndex);
  const fetchDemoBlockState = async () => {
    // getBlockAtPosition(context);
  };
  useEffect(() => {
    fetchDemoBlockState();
  }, []);

  // React Window

  const { height, width } = useWindowDimensions();
  const DISPLAY_GRID_SIZE = 32;
  const DISPLAY_TILES_PER_AXIS = 1000;

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
    return (
      <div
        style={{
          fontSize: 6,
          ...style,
        }}
      >
        {plotX},{plotY}
      </div>
    );
  };

  const Example = () => (
    <Grid
      columnCount={1000}
      columnWidth={DISPLAY_GRID_SIZE}
      rowCount={1000}
      rowHeight={DISPLAY_GRID_SIZE}
      width={width}
      height={height * 0.9}
      initialScrollLeft={(DISPLAY_TILES_PER_AXIS * 0.5 - 4) * DISPLAY_GRID_SIZE}
      initialScrollTop={(DISPLAY_TILES_PER_AXIS * 0.5 - 4) * DISPLAY_GRID_SIZE}
    >
      {Cell}
    </Grid>
  );

  return (
    <>
      <p>Test Page</p>
      {position ? position : "??"}
      <Example />
    </>
  );
}
