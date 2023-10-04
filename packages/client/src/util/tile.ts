import { Entity, Has, HasValue, Not, runQuery } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { MUDEnums } from "contracts/config/enums";
import { components } from "src/network/components";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { BlockType } from "./constants";

export function getResourceKey(coord: Coord) {
  const resourceDimensions = { width: 37, length: 25 };

  if (coord.x < 0 || coord.x > resourceDimensions.width || coord.y < 0 || coord.y > resourceDimensions.length) {
    return null;
  }

  const resource = components.P_Terrain.getWithKeys(coord, { value: 0 })?.value;

  if (MUDEnums.EResource[resource] == BlockType.Air) {
    return 0;
  }

  return resource;
}

export function getBuildingsOfTypeInRange(origin: Coord, type: Entity, range: number) {
  const tiles: Coord[] = [];

  for (let x = -range; x <= range; x++) {
    for (let y = -range; y <= range; y++) {
      const currentCoord = { x: origin.x + x, y: origin.y + y };

      //get entity at coord
      const entities = runQuery([HasValue(components.Position, currentCoord), Has(components.BuildingType)]);

      const buildingType = components.BuildingType.get(entities.values().next().value)?.value;

      if (type === buildingType) {
        tiles.push(currentCoord);
      }
    }
  }

  return tiles;
}

export const getEntityTileAtCoord = (coord: Coord) => {
  const entities = runQuery([
    Has(components.BuildingType),
    Has(components.OwnedBy),
    HasValue(components.Position, coord),
  ]);
  if (!entities.size) return undefined;

  const tileEntity = entities.values().next().value;

  return components.BuildingType.get(tileEntity)?.value;
};

export const getBuildingAtCoord = (coord: Coord) => {
  const entities = runQuery([
    HasValue(components.Position, {
      x: coord.x,
      y: coord.y,
      parent: ActiveAsteroid.get()?.value,
    }),
    Not(components.BuildingType),
  ]);

  if (entities.size === 0) return undefined;
  const tileEntity = [...entities][0];

  const entity = components.OwnedBy.get(tileEntity)?.value;
  return entity;
};
