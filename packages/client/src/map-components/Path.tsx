import { Polyline } from "react-leaflet";
import { DisplayTile } from "../util/constants";

export default function Path({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  // detect which direction the arrow is going
  return (
    <>
      <Polyline
        key={`tile: ${JSON.stringify(startCoord)}`}
        pathOptions={{
          color: "blue",
          dashArray: "20 20",
          weight: 10,
        }}
        positions={[
          [startCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, startCoord.x + 0.5],
          [endCoord.y + 0.5, endCoord.x + 0.5],
        ]}
        pane="popupPane"
      />
    </>
  );
}
