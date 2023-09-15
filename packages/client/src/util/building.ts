import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import {
  BuildingType,
  Level,
  P_MaxStorage,
  P_Production,
  P_RequiredTile,
  P_UtilityProductionComponent as P_UtilityProduction,
  RawBlueprint,
} from "src/network/components/chainComponents";
import { getBuildingAtCoord, getResourceKey } from "./tile";
import { Account } from "src/network/components/clientComponents";
import { outOfBounds } from "./outOfBounds";
import { clampedIndex, getBlockTypeName, toRomanNumeral } from "./common";
import { BackgroundImage, ResourceType, ResourceStorages } from "./constants";
import { hashAndTrimKeyEntity } from "./encode";

type Dimensions = { width: number; height: number };
export const blueprintCache = new Map<EntityID, Dimensions>();

export function calcDims(entity: EntityID, coordinates: Coord[]): Dimensions {
  if (blueprintCache.has(entity)) return blueprintCache.get(entity)!;
  let minX = coordinates[0].x;
  let maxX = coordinates[0].x;
  let minY = coordinates[0].y;
  let maxY = coordinates[0].y;

  for (let i = 1; i < coordinates.length; i++) {
    minX = Math.min(minX, coordinates[i].x);
    maxX = Math.max(maxX, coordinates[i].x);
    minY = Math.min(minY, coordinates[i].y);
    maxY = Math.max(maxY, coordinates[i].y);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  blueprintCache.set(entity, { width, height });
  return { width, height };
}

export function convertToCoords(numbers: number[]): Coord[] {
  if (numbers.length % 2 !== 0) {
    throw new Error("Input array must contain an even number of elements");
  }

  const coordinates: Coord[] = [];

  for (let i = 0; i < numbers.length; i += 2) {
    coordinates.push({ x: numbers[i], y: numbers[i + 1] });
  }

  return coordinates;
}

export function relCoordToAbs(coordinates: Coord[], origin: Coord): Coord[] {
  return coordinates.map((coord) => ({
    x: coord.x + origin.x,
    y: coord.y + origin.y,
  }));
}

export function getBuildingOrigin(source: Coord, building: EntityID) {
  const blueprint = RawBlueprint.get(building)?.value;
  if (!blueprint) return;
  const topLeftCoord = getTopLeftCoord(convertToCoords(blueprint));
  if (!blueprint) return;
  return { x: source.x - topLeftCoord.x, y: source.y - topLeftCoord.y };
}

export function getBuildingTopLeft(origin: Coord, buildingType: EntityID) {
  const rawBlueprint = RawBlueprint.get(buildingType)?.value;
  if (!rawBlueprint) throw new Error("No blueprint found");
  const relativeTopLeft = getTopLeftCoord(convertToCoords(rawBlueprint));
  return { x: origin.x + relativeTopLeft.x, y: origin.y + relativeTopLeft.y };
}

export function getTopLeftCoord(coordinates: Coord[]): Coord {
  if (coordinates.length === 0)
    throw new Error("Cannot get top left coordinate of empty array");
  if (coordinates.length === 1) return coordinates[0];

  let minX = coordinates[0].x;
  let maxY = coordinates[0].y;

  for (let i = 1; i < coordinates.length; i++) {
    minX = Math.min(minX, coordinates[i].x);
    maxY = Math.max(maxY, coordinates[i].y);
  }

  return { x: minX, y: maxY };
}

export function getBuildingDimensions(building: EntityID) {
  const blueprint = RawBlueprint.get(building)?.value;

  const dimensions = blueprint
    ? calcDims(building, convertToCoords(blueprint))
    : { width: 1, height: 1 };

  return dimensions;
}

export const validateBuildingPlacement = (coord: Coord, bulding: EntityID) => {
  //get building dimesions
  const buildingDimensions = getBuildingDimensions(bulding);
  const player = Account.get()?.value;
  const requiredTile = P_RequiredTile.get(bulding)?.value;

  //iterate over dimensions and check if there is a building there
  for (let x = 0; x < buildingDimensions.width; x++) {
    for (let y = 0; y < buildingDimensions.height; y++) {
      const buildingCoord = { x: coord.x + x, y: coord.y - y };
      if (getBuildingAtCoord(buildingCoord)) return false;
      if (outOfBounds(buildingCoord, player)) return false;
      if (requiredTile && requiredTile !== getResourceKey(buildingCoord))
        return false;
    }
  }

  return true;
};

export const getBuildingName = (building: EntityID) => {
  const buildingType = BuildingType.get(building)?.value;
  const level = Level.get(building)?.value ?? 1;

  if (!buildingType) return null;

  return `${getBlockTypeName(buildingType)} ${toRomanNumeral(level)}`;
};

export const getBuildingStorages = (building: EntityID) => {
  const resourceStorages = ResourceStorages.map((resourceId) => {
    const buildingResourceEntity = hashAndTrimKeyEntity(resourceId, building);
    const storage = P_MaxStorage.get(buildingResourceEntity)?.value;

    if (!storage) return null;

    return {
      resourceId,
      resourceType: ResourceType.Resource,
      amount: storage,
    };
  });

  const utilityProduction = P_UtilityProduction.get(building);

  const utilityStorage = utilityProduction
    ? {
        resourceId: utilityProduction.ResourceID,
        resourceType: ResourceType.Utility,
        amount: utilityProduction.ResourceProduction,
      }
    : null;

  return [...resourceStorages, utilityStorage].filter(
    (storage) => !!storage
  ) as {
    resourceId: EntityID;
    resourceType: ResourceType;
    amount: number;
  }[];
};

export const getBuildingInfo = (building: EntityID) => {
  const buildingType = BuildingType.get(building)?.value;
  const level = Level.get(building)?.value ?? 1;

  if (!buildingType) return;

  const buildingLevelEntity = hashAndTrimKeyEntity(buildingType, level);
  const production = P_Production.get(buildingLevelEntity);
  const storages = getBuildingStorages(buildingLevelEntity);

  let imageUri = "";
  if (BackgroundImage.has(buildingType)) {
    const imageIndex = parseInt(level ? level.toString() : "1") - 1;

    imageUri =
      BackgroundImage.get(buildingType)![
        clampedIndex(imageIndex, BackgroundImage.get(buildingType)!.length)
      ];
  }

  return {
    buildingType,
    level,
    buildingName: `${getBlockTypeName(buildingType)} ${toRomanNumeral(level)}`,
    imageUri,
    production,
    storages,
  };
};
