import React from "react";

import { Rectangle } from "react-leaflet";

function SelectedTile({
  x,
  y,
  color,
  pane,
}: {
  x: number;
  y: number;
  color: string;
  pane?: string;
}) {
  return (
    <Rectangle
      bounds={[
        [y, x],
        [y + 1, x + 1],
      ]}
      pathOptions={{
        weight: 4,
        color: color,
      }}
      pane={pane || "tooltipPane"}
    />
  );
}

export default React.memo(SelectedTile);
