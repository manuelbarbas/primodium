import React, { useCallback, useMemo } from "react";

import { EntityID } from "@latticexyz/recs";

import { Rectangle } from "react-leaflet";

import { BlockColors, DisplayTile } from "../util/constants";

const TILE_SIZE: number = 16;
const SCALE_FACTOR: number = 16;

function ResourceTile({
  x,
  y,
  tileKey,
  setSelectedTile,
}: {
  x: number;
  y: number;
  tileKey: EntityID;
  setSelectedTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
}) {
  const setSelectedTileHelper = useCallback(() => {
    console.log("Tile clicked", x, y);
    setSelectedTile({ x, y });
  }, []);

  const eventHandlers = useMemo(() => {
    return {
      click: setSelectedTileHelper,
    };
  }, []);

  return (
    <Rectangle
      key={JSON.stringify({ x, y })}
      bounds={[
        [y, x],
        [y + TILE_SIZE / SCALE_FACTOR, x + TILE_SIZE / SCALE_FACTOR],
      ]}
      pathOptions={{
        fillOpacity: 1,
        weight: 1,
        color: BlockColors.get(tileKey),
      }}
      eventHandlers={eventHandlers}
    />
  );
}

export default React.memo(ResourceTile);
