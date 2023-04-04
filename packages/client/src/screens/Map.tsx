import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  MouseEvent,
} from "react";

import { Has, HasValue, EntityID } from "@latticexyz/recs";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";

import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { FixedSizeGrid as Grid } from "react-window";
import { BigNumber } from "ethers";

import {
  // getTerrainNormalizedDepth,
  // getResourceNormalizedDepth,
  getTopLayerKey,
} from "../util/tile";
import { BlockColors } from "../util/constants";

import useWindowDimensions from "../hooks/useWindowDimensions";

import { BlockType } from "../util/constants";
import { useMud } from "../context/MudContext";

export default function Map() {
  const { systems, components, singletonIndex } = useMud();

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

  // Block entity test
  // const counter = useComponentValue(
  //   components.Position,
  //   world.entityToIndex.get(BlockType.LithiumMiner)
  // );

  const perlinRef = useRef(null as null | Perlin);

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  // const getTerrainNormalizedDepthHelper = useCallback(
  //   (coord: Coord) => {
  //     if (!initialized || perlinRef.current === null) {
  //       return 0;
  //     }
  //     if (perlinRef.current !== null) {
  //       const perlin = perlinRef.current;
  //       return getTerrainNormalizedDepth(coord, perlin);
  //     } else {
  //       return 0;
  //     }
  //   },
  //   [initialized]
  // );

  // //resource gen
  // const getResourceNormalizedDepthHelper = useCallback(
  //   (coord: Coord) => {
  //     if (!initialized || perlinRef.current === null) {
  //       return 0;
  //     }
  //     if (perlinRef.current !== null) {
  //       const perlin = perlinRef.current;
  //       return getResourceNormalizedDepth(coord, perlin);
  //     } else {
  //       return 0;
  //     }
  //   },
  //   [initialized]
  // );

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
      useMemo(
        () => [
          Has(components.Tile),
          HasValue(components.Position, { x: plotX, y: plotY }),
        ],
        [components.Tile, components.Position]
      )
    );

    const tile = useComponentValue(
      components.Tile,
      tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
    );

    // Build tiles
    const buildMinerHelper = useCallback((event: MouseEvent) => {
      event.preventDefault();
      buildTile(plotX, plotY, BlockType.LithiumMiner);
    }, []);

    const buildConveyerHelper = useCallback((event: MouseEvent) => {
      event.preventDefault();
      buildTile(plotX, plotY, BlockType.Conveyer);
    }, []);

    const destroyTileHelper = useCallback((event: MouseEvent) => {
      event.preventDefault();
      destroyTile(plotX, plotY);
    }, []);

    // Create paths
    const startPathHelper = useCallback((event: MouseEvent) => {
      event.preventDefault();
      startPath(plotX, plotY);
    }, []);

    const endPathHelper = useCallback((event: MouseEvent) => {
      event.preventDefault();
      endPath(plotX, plotY);
    }, []);

    // // Calculate tile perlin result
    // const terrainDepth = getTerrainNormalizedDepthHelper({
    //   x: plotX,
    //   y: plotY,
    // });
    // const resourceDepth = getResourceNormalizedDepthHelper({
    //   x: plotX,
    //   y: plotY,
    // });

    let topLayerKey;

    if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile) {
      topLayerKey = tile.value;
    } else {
      topLayerKey = getTopLayerKeyHelper({
        x: plotX,
        y: plotY,
      });
    }

    // Styling
    const defaultStyle = {
      fontSize: 3,
      backgroundColor: BlockColors.get(topLayerKey as EntityID),
      ...style,
    };

    let displayStyle;
    if (startPathTile.x === plotX && startPathTile.y === plotY) {
      displayStyle = {
        ...defaultStyle,
        outlineStyle: "dotted",
        outlineWidth: 1,
        outlineColor: "#ba524a",
        ...style,
      };
    } else if (endPathTile.x === plotX && endPathTile.y === plotY) {
      displayStyle = {
        ...defaultStyle,
        outlineStyle: "dotted",
        outlineWidth: 1,
        outlineColor: "#4aba6f",
        ...style,
      };
    } else {
      displayStyle = defaultStyle;
    }

    // return blank terrain tiles for aesthetics
    return <div style={displayStyle}></div>;

    return (
      <div style={displayStyle}>
        <button onClick={buildMinerHelper}>
          <b>-m</b>
        </button>
        <button onClick={buildConveyerHelper}>
          <b>-c</b>
        </button>
        <button onClick={destroyTileHelper}>
          <b>&lt;d&gt;</b>
        </button>
        <br />
        p:
        <button onClick={startPathHelper}>
          <b>-s-</b>
        </button>
        <button onClick={endPathHelper}>
          <b>-e-</b>
        </button>
        <br />
        {plotX},{plotY}
        {/* <br />
        {Math.round(terrainDepth * 100) / 100}
        <br />
        <b>{Math.round(resourceDepth * 100) / 100}</b>
        <br /> */}
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
