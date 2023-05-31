import { DisplayTile } from "../util/constants";
import ArrowedPolyline from "./ArrowedPolyline";

export default function SelectedAttack({
  startCoord,
  endCoord,
}: {
  startCoord: DisplayTile;
  endCoord: DisplayTile;
}) {
  return (
    <ArrowedPolyline
      key={`ssp: ${JSON.stringify(startCoord)}`}
      pathOptions={{
        color: "cyan",
        dashArray: "10 30",
        weight: 5,
      }}
      positions={[
        [startCoord.y + 0.5, startCoord.x + 0.5],
        [endCoord.y + 0.5, endCoord.x + 0.5],
      ]}
      pane="popupPane"
    />
  );
}
