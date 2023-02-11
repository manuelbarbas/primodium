import React from "react";

import { Rectangle } from "react-leaflet";

function SelectedTile({ x, y }: { x: number; y: number }) {
  return (
    <Rectangle
      bounds={[
        [y, x],
        [y + 1, x + 1],
      ]}
      pathOptions={{
        weight: 0,
        color: "yellow",
      }}
    />
  );
}

export default React.memo(SelectedTile);
