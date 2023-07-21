import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { FixedSizeGrid as Grid } from "react-window";

import { useMud } from "../context/MudContext";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { BlockColors } from "../util/constants";
import { getTopLayerKey } from "src/util/tile";

export default function Map() {
  const { perlin, components, singletonIndex } = useMud();

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
    const plotY = displayIndexToTileIndex(rowIndex) * -1;

    const tilesAtPosition = useEntityQuery(
      [
        Has(components.BuildingType),
        HasValue(components.Position, { x: plotX, y: plotY }),
      ],
      { updateOnValueChange: true }
    );

    const tile = useComponentValue(
      components.BuildingType,
      tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
    );

    let topLayerKey;
    if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile) {
      topLayerKey = tile.value;
    } else {
      topLayerKey = getTopLayerKey(
        {
          x: plotX,
          y: plotY,
        },
        perlin
      );
    }

    const defaultStyle = {
      fontSize: 3,
      backgroundColor: BlockColors.get(topLayerKey as EntityID),
      ...style,
    };
    return <div style={defaultStyle}></div>;
  };

  const TileMap = () => (
    <Grid
      columnCount={DISPLAY_TILES_PER_AXIS}
      columnWidth={DISPLAY_GRID_SIZE}
      rowCount={DISPLAY_TILES_PER_AXIS}
      rowHeight={DISPLAY_GRID_SIZE}
      width={width}
      height={height}
      initialScrollLeft={DISPLAY_TILES_PER_AXIS * 0.5 * DISPLAY_GRID_SIZE}
      initialScrollTop={DISPLAY_TILES_PER_AXIS * 0.5 * DISPLAY_GRID_SIZE}
    >
      {Cell}
    </Grid>
  );

  return <TileMap />;
}
