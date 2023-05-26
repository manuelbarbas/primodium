import { useMemo, memo } from "react";

import { Has, HasValue, EntityID, getComponentValue } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { ImageOverlay } from "react-leaflet";

import { BackgroundImage } from "../util/constants";
import { useMud } from "../context/MudContext";
import Path from "./Path";

// tileKey prop is the default terrain beneath any building on top.
function ResourceTile({
  x,
  y,
  terrain,
  resource,
}: {
  x: number;
  y: number;
  terrain: EntityID;
  resource: EntityID | null;
}) {
  const { world, components, singletonIndex } = useMud();

  // Get tile information
  const tilesAtPosition = useEntityQuery(
    [Has(components.Tile), HasValue(components.Position, { x: x, y: y })],
    { updateOnValueChange: true }
  );

  const tile = useComponentValue(
    components.Tile,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  let buildingKey: EntityID | undefined;
  if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile) {
    buildingKey = tile.value as unknown as EntityID;
  }

  const path = useComponentValue(
    components.Path,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  // Get the tile at the end of the conveyor path.
  const endPathTile = useComponentValue(
    components.Position,
    path
      ? world.entityToIndex.get(path.value.toString() as EntityID)
      : singletonIndex
  );

  // Get all conveyor paths that end at this tile.
  const endingConveyorPaths = useEntityQuery(
    [
      Has(components.Path),
      HasValue(components.Path, {
        value:
          tilesAtPosition.length > 0
            ? (world.entities[tilesAtPosition[0]] as unknown as number)
            : 0,
      }),
    ],
    { updateOnValueChange: true }
  );

  // Get the conveyor path that start at this tile.
  const pathsToRender: JSX.Element[] = useMemo(() => {
    const curPathsToRender: JSX.Element[] = [];

    if (path && endPathTile) {
      // Path that starts at the current selected tile
      curPathsToRender.push(
        <Path key="curTile" startCoord={{ x, y }} endCoord={endPathTile} />
      );
    }

    endingConveyorPaths.map((item) => {
      // Paths that ends at the current tile
      const currentStartTile = getComponentValue(components.Position, item);
      if (currentStartTile) {
        curPathsToRender.push(
          <Path
            key={JSON.stringify({
              start: currentStartTile,
              end: { x, y },
            })}
            startCoord={currentStartTile}
            endCoord={{ x, y }}
          ></Path>
        );
      }
    });

    return curPathsToRender;
  }, [endPathTile, endingConveyorPaths, path, x, y]);

  //!!Used for setting an image background!!
  const terrainBackground = BackgroundImage.get(terrain as EntityID);
  const resourceBackground = BackgroundImage.get(resource as EntityID);

  return (
    <>
      {/* !!setting an image background!! */}
      {buildingKey && (
        <ImageOverlay
          className="pixel-images"
          bounds={[
            [y, x],
            [y + 1, x + 1],
          ]}
          url={BackgroundImage.get(buildingKey)!}
          zIndex={11}
        />
      )}
      {resource && !buildingKey && (
        <ImageOverlay
          className="pixel-images"
          bounds={[
            [y, x],
            [y + 1, x + 1],
          ]}
          url={resourceBackground!}
          zIndex={11}
        />
      )}
      {!buildingKey && (
        <ImageOverlay
          className="pixel-images"
          bounds={[
            [y, x],
            [y + 1, x + 1],
          ]}
          url={terrainBackground!}
          zIndex={10}
        />
      )}
      {pathsToRender}
    </>
  );
}

export default memo(ResourceTile);
