import { memo, useMemo } from "react";

import { Has, HasValue, EntityID, EntityIndex } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";

import { Rectangle, Polyline, ImageOverlay } from "react-leaflet";

// import ReactDOMServer from "react-dom/server";
// import L from "leaflet";
// import { Marker } from "react-leaflet";

import { BlockColors, BackgroundImage } from "../util/constants";

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

  //!!Used for setting an image background!!
  let imagebackground = BackgroundImage.get(topLayerKey as EntityID);

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
      />
      {/* !!setting an image background!! */}
      {/* <ImageOverlay
        key={JSON.stringify({ x, y })}
        bounds={[
          [y, x],
          [y + 1, x + 1],
        ]}
        url={imagebackground}
        layerOptions={{
          pane: "overlayPane",
        }}
      /> */}
    </>
  );
}

export default memo(ResourceTile);
