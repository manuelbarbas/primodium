import { Polyline } from "react-leaflet";
import { DisplayTile } from "../util/constants";

export default function SelectedPath({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  return (
    <Polyline
      key="path-in-progress-1"
      pathOptions={{
        color: "brown",
        dashArray: "10 30",
        weight: 10,
      }}
      positions={[
        [startCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, endCoord.x + 0.5],
      ]}
      pane="markerPane"
    />
  );
}
