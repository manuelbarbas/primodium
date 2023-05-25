import { EntityID } from "@latticexyz/recs";
import React from "react";

import { ImageOverlay, Rectangle } from "react-leaflet";
import { BackgroundImage, BlockType } from "../util/constants";
import { useGameStore } from "../store/GameStore";
import ResourceTile from "./ResourceTile";
import { SingletonID } from "@latticexyz/network";

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
  const [selectedPathTile] = useGameStore((state) => [state.selectedPathTiles]);

  return (
    <>
      {selectedBlock !== BlockType.Conveyor && selectedBlock !== null && (
        <ImageOverlay
          className="pixel-images border-dashed border-4 border-pink-500"
          bounds={[
            [y, x],
            [y + 1, x + 1],
          ]}
          url={BackgroundImage.get(selectedBlock)!}
          pane={pane || "tooltipPane"}
          zIndex={50}
        />
      )}
      {selectedBlock === BlockType.Conveyor && (
        <Rectangle
          bounds={[
            [y, x],
            [y + 1, x + 1],
          ]}
          pathOptions={{
            weight: 4,
            color: selectedPathTile.start === null ? "green" : "red",
          }}
          pane={pane || "tooltipPane"}
        />
      )}
    </>
  );
}

export default React.memo(HoverTile);
