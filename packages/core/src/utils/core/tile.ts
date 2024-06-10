import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Tables, Coord } from "@/lib/types";
import { getBuildingPositionEntity } from "@/utils/global/encode";

export function createTileUtils(tables: Tables) {
  function getResourceKey(coord: Coord, mapId = 1) {
    const resourceDimensions = { width: 37, length: 25 };

    if (coord.x < 0 || coord.x > resourceDimensions.width || coord.y < 0 || coord.y > resourceDimensions.length) {
      return null;
    }

    const resource = tables.P_Terrain.getWithKeys({ mapId, ...coord }, { value: 0 })?.value;

    return resource;
  }

  function getBuildingsOfTypeInRange(origin: Coord, type: Entity, range: number) {
    const tiles: Coord[] = [];

    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        const currentCoord = { x: origin.x + x, y: origin.y + y };

        //get entity at coord
        const entities = runQuery([HasValue(tables.Position, currentCoord), Has(tables.BuildingType)]);

        const buildingType = tables.BuildingType.get(entities.values().next().value)?.value;

        if (type === buildingType) {
          tiles.push(currentCoord);
        }
      }
    }

    return tiles;
  }

  const getEntityTileAtCoord = (coord: Coord) => {
    const entities = runQuery([Has(tables.BuildingType), Has(tables.OwnedBy), HasValue(tables.Position, coord)]);
    if (!entities.size) return undefined;

    const tileEntity = entities.values().next().value;

    return tables.BuildingType.get(tileEntity)?.value;
  };

  const getBuildingAtCoord = (coord: Coord, asteroid: Entity) => {
    const positionEntity = getBuildingPositionEntity(coord, asteroid);
    return tables.ReverseBuildingPosition.get(positionEntity)?.value;
  };

  return {
    getResourceKey,
    getBuildingPositionEntity,
    getBuildingsOfTypeInRange,
    getEntityTileAtCoord,
    getBuildingAtCoord,
  };
}
