import { Has, HasValue, Not, runQuery } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

export function getBuildingsOfTypeInRange(origin: Coord, type: Entity, range: number) {
  const tiles: Coord[] = [];

  for (let x = -range; x <= range; x++) {
    for (let y = -range; y <= range; y++) {
      const currentCoord = { x: origin.x + x, y: origin.y + y };

      //get entity at coord
      const entities = runQuery([HasValue(Position, currentCoord), Has(BuildingType)]);

      const buildingType = BuildingType.get(entities.values().next().value)?.value;

      if (type === buildingType) {
        tiles.push(currentCoord);
      }
    }
  }

  return tiles;
}

export const getEntityTileAtCoord = (coord: Coord) => {
  const entities = runQuery([Has(BuildingType), Has(OwnedBy), HasValue(Position, coord)]);
  if (!entities.size) return undefined;

  const tileEntityID = entities.values().next().value;

  return BuildingType.get(tileEntityID)?.value;
};

export const getBuildingAtCoord = (coord: Coord) => {
  const entities = runQuery([
    HasValue(Position, {
      x: coord.x,
      y: coord.y,
      parent: HomeAsteroid.get()?.value,
    }),
    Not(BuildingType),
  ]);

  if (entities.size === 0) return undefined;
  const tileEntity = [...entities][0];

  const entity = OwnedBy.get(tileEntity)?.value;
  return entity;
};
