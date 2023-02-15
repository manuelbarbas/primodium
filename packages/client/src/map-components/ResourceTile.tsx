import { memo, useMemo } from "react";

import {
  Has,
  HasValue,
  EntityID,
  EntityIndex,
  getComponentValue,
} from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { Rectangle, Polyline } from "react-leaflet";

// import ReactDOMServer from "react-dom/server";
// import L from "leaflet";
// import { Marker } from "react-leaflet";

import { BlockColors } from "../util/constants";

import { components } from "..";
import { singletonIndex } from "..";

// tileKey prop is the default terrain beneath any building on top.
function ResourceTile({
  x,
  y,
  tileKey,
}: {
  x: number;
  y: number;
  tileKey: EntityID;
}) {
  // Get tile information
  const tilesAtPosition = useEntityQuery(
    useMemo(
      () => [
        Has(components.Tile),
        HasValue(components.Position, { x: x, y: y }),
      ],
      [components.Tile, components.Position]
    )
  );

  const tile = useComponentValue(
    components.Tile,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  let topLayerKey;
  if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile) {
    topLayerKey = tile.value;
  } else {
    topLayerKey = tileKey;
  }

  // Get the conveyer path that start at this tile.
  let pathsToRender: JSX.Element[] = [];

  // const path = useComponentValue(
  //   components.Path,
  //   tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  // );

  // // Get the tile at the end of the conveyer path.
  // const endPathTile = useComponentValue(
  //   components.Position,
  //   path ? (path.value as EntityIndex) : singletonIndex
  // );

  // if (path && endPathTile) {
  //   // Path that starts at the current selected tile
  //   pathsToRender.push(
  //     <Polyline
  //       key="path-in-progress-1"
  //       pathOptions={{
  //         color: "blue",
  //         dashArray: "10 30",
  //         weight: 10,
  //       }}
  //       positions={[
  //         [y + 0.5, x + 0.5],
  //         [endPathTile.y + 0.5, x + 0.5],
  //         [endPathTile.y + 0.5, endPathTile.x + 0.5],
  //       ]}
  //       pane="overlayPane"
  //     />
  //   );
  // }

  // // Get all conveyer paths that end at this tile.
  // const endingConveyerPaths = useEntityQuery(
  //   useMemo(
  //     () => [
  //       Has(components.Path),
  //       HasValue(components.Path, {
  //         value:
  //           tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex,
  //       }),
  //     ],
  //     [components.Path]
  //   )
  // );

  // endingConveyerPaths.map((item) => {
  //   const currentStartEntity = getComponentValue(components.Path, item);
  //   if (currentStartEntity) {
  //     // Paths that ends at the current tile
  //     const currentStartTile = getComponentValue(
  //       components.Position,
  //       currentStartEntity.value as EntityIndex
  //     );
  //     if (currentStartTile) {
  //       pathsToRender.push(
  //         <Polyline
  //           key="path-in-progress-1"
  //           pathOptions={{
  //             color: "blue",
  //             dashArray: "10 30",
  //             weight: 10,
  //           }}
  //           positions={[
  //             [currentStartTile.y + 0.5, currentStartTile.x + 0.5],
  //             [y + 0.5, currentStartTile.x + 0.5],
  //             [y + 0.5, x + 0.5],
  //           ]}
  //           pane="overlayPane"
  //         />
  //       );
  //     }
  //   }
  // });

  // // Debug to show tile info
  // const DivElement = (
  //   <p>
  //     {x}, {y}
  //     <br />
  //     {BlockIdToKey[topLayerKey as EntityID]}
  //   </p>
  // );
  // let icon = new L.DivIcon({
  //   iconSize: [1, 1],
  //   html: ReactDOMServer.renderToString(DivElement),
  // });

  return (
    <>
      {/* <Marker
        key={JSON.stringify({ x, y, icon: "icon" })}
        position={[y + 0.5, x + 0.5]}
        icon={icon}
      /> */}
      <Rectangle
        key={JSON.stringify({ x, y })}
        bounds={[
          [y, x],
          [y + 1, x + 1],
        ]}
        pathOptions={{
          fillOpacity: 1,
          weight: 1,
          color: BlockColors.get(topLayerKey as EntityID),
        }}
        pane="mapPane"
      />
      {pathsToRender}
    </>
  );
}

export default memo(ResourceTile);
