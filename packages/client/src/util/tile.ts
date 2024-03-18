import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { Hex } from "viem";
import { encodeEntity } from "./encode";

export function getResourceKey(coord: Coord, mapId = 1) {
  const resourceDimensions = { width: 37, length: 25 };

  if (coord.x < 0 || coord.x > resourceDimensions.width || coord.y < 0 || coord.y > resourceDimensions.length) {
    return null;
  }

  const resource = components.P_Terrain.getWithKeys({ mapId, ...coord }, { value: 0 })?.value;

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

export const getBuildingAtCoord = (coord: Coord, asteroid: Entity) => {
  const positionEntity = getBuildingPositionEntity(coord, asteroid);
  return components.ReverseBuildingPosition.get(positionEntity)?.value;
};

export const getBuildingPositionEntity = (coord: Coord, asteroid: Entity) => {
  return encodeEntity(
    { x: "int32", y: "int32", asteroid: "bytes32" },
    { x: coord.x, y: coord.y, asteroid: asteroid as Hex }
  );
};
