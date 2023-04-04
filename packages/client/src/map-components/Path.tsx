import { DisplayTile } from "../util/constants";
import MovingCirclePolyline from "./MovingCirclePolyline";

export default function Path({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  return (
    <MovingCirclePolyline
      key={`sp: ${JSON.stringify(startCoord)}`}
      pathOptions={{
        color: "white",
        weight: 5,
      }}
      positions={[
        [startCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, endCoord.x + 0.5],
      ]}
      circleColor="white"
      pane="popupPane"
    />
  );
}
