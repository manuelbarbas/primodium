import { getBuildingsOfTypeInRange } from "../../util/tile";
import MapArrow from "./MapArrow";
import { Coord } from "@latticexyz/utils";
import { EntityID } from "@latticexyz/recs";
import { useMud } from "../../context/MudContext";

const MapBuildingHints = ({
  origin,
  range,
  blockType,
  near = false,
}: {
  origin: Coord;
  range: number;
  blockType: EntityID;
  near?: boolean;
}) => {
  const { components } = useMud();
  let tiles: Coord[] = [];

  // useEffect(() => {

  // }, []);

  tiles = getBuildingsOfTypeInRange(origin, blockType, range, components);

  if (near) {
    //shift coords right by 1
    tiles = tiles.map((tile) => {
      return { x: tile.x + 1, y: tile.y };
    });
  }

  return (
    <>
      {tiles.map((tile) => {
        return (
          <div
            key={`map-building-hint, origin: ${tile.x}-${tile.y} resource: ${blockType}`}
          >
            <MapArrow x={tile.x} y={tile.y} highlight />
          </div>
        );
      })}
    </>
  );
};

export default MapBuildingHints;
