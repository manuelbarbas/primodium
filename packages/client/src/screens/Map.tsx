import { Perlin, createPerlin } from "@latticexyz/noise";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { FixedSizeGrid as Grid } from "react-window";

import { useMud } from "src/hooks/useMud";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { BlockColors } from "../util/constants";
import { getTopLayerKey } from "../util/tile";

export default function Map() {
  const { components, singletonIndex } = useMud();
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
        return "#ffffff";
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKey(coord, perlin);
      } else {
        return "#ffffff";
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
      topLayerKey = getTopLayerKeyHelper({
        x: plotX,
        y: plotY,
      });
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

  if (!initialized) {
    return <p>Initializing...</p>;
  }
  return (
    <>
      <TileMap />
    </>
  );
}
