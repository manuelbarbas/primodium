import { Entity, query } from "@primodiumxyz/reactive-tables";
import { Coord, Tables } from "@/lib/types";
import { getBuildingPositionEntity } from "@/utils/global/encode";

export function createTileUtils(tables: Tables) {
  /**
   * Gets the resource key at a given coord
   *
   * @param coord
   * @param mapId
   * @returns
   */
  function getResourceKey(coord: Coord, mapId = 1): number | null {
    const resourceDimensions = { width: 37, length: 25 };

    if (coord.x < 0 || coord.x > resourceDimensions.width || coord.y < 0 || coord.y > resourceDimensions.length) {
      return null;
    }

    const resource = tables.P_Terrain.getWithKeys({ mapId, ...coord }, { value: 0 })?.value;

    return resource;
  }

  /**
   * Gets all buildings of a given type within a range of a given origin
   *
   * @param origin Origin coord
   * @param type Building type
   * @param range Range to search
   * @returns Array of coords
   */

  function getBuildingsOfTypeInRange(origin: Coord, type: Entity, range: number): Coord[] {
    const tiles: Coord[] = [];

    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        const currentCoord = { x: origin.x + x, y: origin.y + y };

        //get entity at coord
        const entities = query({
          withProperties: [{ table: tables.Position, properties: currentCoord }],
          with: [tables.BuildingType],
        });

        const buildingType = tables.BuildingType.get(entities.values().next().value)?.value;

        if (type === buildingType) {
          tiles.push(currentCoord);
        }
      }
    }

    return tiles;
  }

  /** Gets the building at a given coord */
  const getBuildingAtCoord = (coord: Coord, asteroid: Entity) => {
    const positionEntity = getBuildingPositionEntity(coord, asteroid);
    return tables.ReverseBuildingPosition.get(positionEntity)?.value;
  };

  return {
    getResourceKey,
    getBuildingPositionEntity,
    getBuildingsOfTypeInRange,
    getBuildingAtCoord,
  };
}
