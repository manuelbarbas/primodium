import { Polyline, Circle } from "react-leaflet";
import { DisplayTile } from "../util/constants";

export default function Path({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  return (
    <>
      <Polyline
        key={`tile: ${JSON.stringify(startCoord)}`}
        pathOptions={{
          weight: 5,
        }}
        positions={[
          [startCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, startCoord.x + 0.5],
        ]}
        pane="popupPane"
      />
      <Polyline
        key={`tile: ${JSON.stringify(startCoord)}`}
        pathOptions={{
          weight: 5,
        }}
        positions={[
          [endCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, endCoord.x + 0.5],
        ]}
        pane="popupPane"
      />
      <Circle
        key={`tile: ${JSON.stringify(startCoord)}`}
        pathOptions={{
          weight: 5,
        }}
        center={[endCoord.y + 0.5, endCoord.x + 0.5]}
        radius={0.25}
        pane="popupPane"
      />
    </>
  );
}
