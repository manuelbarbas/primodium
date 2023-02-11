import React from "react";

import { Rectangle } from "react-leaflet";

const TILE_SIZE: number = 16;
const SCALE_FACTOR: number = 16;

function SelectedTile({ x, y }: { x: number; y: number }) {
  return (
    <Rectangle
      bounds={[
        [y, x],
        [y + TILE_SIZE / SCALE_FACTOR, x + TILE_SIZE / SCALE_FACTOR],
      ]}
      pathOptions={{
        weight: 0,
        color: "yellow",
      }}
    />
  );
}

export default React.memo(SelectedTile);
