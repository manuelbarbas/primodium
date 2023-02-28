import { Circle } from "react-leaflet";
import TextPath from "react-leaflet-textpath";
import { DisplayTile } from "../util/constants";

export default function SelectedPath({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  return (
    <>
      <TextPath
        pathOptions={{
          color: "brown",
          dashArray: "10 30",
          weight: 5,
        }}
        positions={[
          [startCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, startCoord.x + 0.5],
        ]}
        text=">"
        pane="popupPane"
      />
      <TextPath
        pathOptions={{
          color: "brown",
          dashArray: "10 30",
          weight: 5,
        }}
        positions={[
          [endCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, endCoord.x + 0.5],
        ]}
        text=">"
        pane="popupPane"
      />
      <Circle
        pathOptions={{
          color: "brown",
          weight: 5,
        }}
        center={[endCoord.y + 0.5, endCoord.x + 0.5]}
        radius={0.25}
        pane="popupPane"
      />
    </>
  );
}
