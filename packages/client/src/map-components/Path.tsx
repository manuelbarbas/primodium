import { Coord } from "@latticexyz/utils";
import MovingCirclePolyline from "./MovingCirclePolyline";

export default function Path({
  startCoord,
  endCoord,
}: {
  startCoord: Coord;
  endCoord: Coord;
}) {
  return (
    <MovingCirclePolyline
      key={`sp: ${JSON.stringify(startCoord)}`}
      pathOptions={{
        color: "white",
        weight: 3,
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
