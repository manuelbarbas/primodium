import { Coord } from "@latticexyz/utils";
import MovingCirclePolyline from "./MovingCirclePolyline";

export default function SelectedPath({
  startCoord,
  endCoord,
}: {
  startCoord: Coord;
  endCoord: Coord;
}) {
  return (
    <MovingCirclePolyline
      key={`ssp: ${JSON.stringify(startCoord)}`}
      pathOptions={{
        color: "magenta",
        dashArray: "10 30",
        weight: 5,
      }}
      positions={[
        [startCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, endCoord.x + 0.5],
      ]}
      circleColor="magenta"
      pane="popupPane"
    />
  );
}
