import { EntityID } from "@latticexyz/recs";
import React from "react";

import { Rectangle } from "react-leaflet";
import { BlockType } from "../util/constants";

function HoverTile({
  x,
  y,
  selectedBlock,
  pane,
}: {
  x: number;
  y: number;
  selectedBlock: EntityID | null;
  pane?: string;
}) {
  let color;
  switch (selectedBlock) {
    case BlockType.Conveyor:
      color = "";
    default:
      color = "pink";
  }
  return (
    <Rectangle
      bounds={[
        [y, x],
        [y + 1, x + 1],
      ]}
      pathOptions={{
        weight: 4,
        color,
      }}
      pane={pane || "tooltipPane"}
    />
  );
}

export default React.memo(HoverTile);
