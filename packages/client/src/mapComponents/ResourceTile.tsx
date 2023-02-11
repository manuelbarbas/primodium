import React from "react";

import { EntityID } from "@latticexyz/recs";

import { Rectangle } from "react-leaflet";

import { BlockColors } from "../util/constants";

function ResourceTile({
  x,
  y,
  tileKey,
}: {
  x: number;
  y: number;
  tileKey: EntityID;
}) {
  return (
    <Rectangle
      key={JSON.stringify({ x, y })}
      bounds={[
        [y, x],
        [y + 1, x + 1],
      ]}
      pathOptions={{
        fillOpacity: 1,
        weight: 1,
        color: BlockColors.get(tileKey),
      }}
    />
  );
}

export default React.memo(ResourceTile);
