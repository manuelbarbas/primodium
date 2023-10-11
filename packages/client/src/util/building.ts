import { primodium } from "@game/api";
// import { EntitytoSpriteKey } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Account } from "src/network/components/clientComponents";
import { Hex } from "viem";
import { clampedIndex, getBlockTypeName, toRomanNumeral } from "./common";
import { ResourceTypes } from "./constants";
import { outOfBounds } from "./outOfBounds";
import { getRecipe, getRecipeDifference } from "./resource";
import { getBuildingAtCoord, getResourceKey } from "./tile";
import { EntitytoSpriteKey } from "@game/constants";

type Dimensions = { width: number; height: number };
export const blueprintCache = new Map<Entity, Dimensions>();

export function calcDims(entity: Entity, coordinates: Coord[]): Dimensions {
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

export function getBuildingOrigin(source: Coord, building: Entity) {
  const blueprint = comps.P_Blueprint.get(building)?.value;
  if (!blueprint) return;
  const topLeftCoord = getTopLeftCoord(convertToCoords(blueprint));

  if (!blueprint) return;
  return { x: source.x - topLeftCoord.x, y: source.y - topLeftCoord.y };
}

export function getBuildingTopLeft(origin: Coord, buildingType: Entity) {
  const rawBlueprint = comps.P_Blueprint.get(buildingType)?.value;
  if (!rawBlueprint) throw new Error("No blueprint found");

  const relativeTopLeft = getTopLeftCoord(convertToCoords(rawBlueprint));

  return { x: origin.x + relativeTopLeft.x, y: origin.y + relativeTopLeft.y };
}

export function getTopLeftCoord(coordinates: Coord[]): Coord {
  if (coordinates.length === 0) throw new Error("Cannot get top left coordinate of empty array");
  if (coordinates.length === 1) return coordinates[0];

  let minX = coordinates[0].x;
  let maxY = coordinates[0].y;

  for (let i = 1; i < coordinates.length; i++) {
    minX = Math.min(minX, coordinates[i].x);
    maxY = Math.max(maxY, coordinates[i].y);
  }

  return { x: minX, y: maxY };
}

export function getBuildingDimensions(building: Entity) {
  const blueprint = comps.P_Blueprint.get(building)?.value;

  const dimensions = blueprint ? calcDims(building, convertToCoords(blueprint)) : { width: 1, height: 1 };

  return dimensions;
}

export const validateBuildingPlacement = (coord: Coord, building: Entity, asteroid: Entity) => {
  //get building dimesions
  const buildingDimensions = getBuildingDimensions(building);
  const player = Account.get()?.value;
  const requiredTile = comps.P_RequiredTile.get(building)?.value;

  //iterate over dimensions and check if there is a building there
  for (let x = 0; x < buildingDimensions.width; x++) {
    for (let y = 0; y < buildingDimensions.height; y++) {
      const buildingCoord = { x: coord.x + x, y: coord.y - y };
      if (getBuildingAtCoord(buildingCoord, asteroid)) return false;
      if (outOfBounds(buildingCoord, player)) return false;
      if (requiredTile && requiredTile !== getResourceKey(buildingCoord)) return false;
    }
  }

  return true;
};

export const getBuildingName = (building: Entity) => {
  const buildingType = comps.BuildingType.get(building)?.value as Entity;
  const level = comps.Level.get(building)?.value ?? 1n;

  if (!buildingType) return null;

  return `${getBlockTypeName(buildingType)} ${toRomanNumeral(Number(level))}`;
};

export const getBuildingImage = (building: Entity) => {
  const buildingType = comps.BuildingType.get(building)?.value as Entity;
  const level = comps.Level.get(building)?.value ?? 1n;
  const { getSpriteBase64 } = primodium.api().sprite;

  if (EntitytoSpriteKey[buildingType]) {
    const imageIndex = parseInt(level ? level.toString() : "1") - 1;

    return getSpriteBase64(
      EntitytoSpriteKey[buildingType][clampedIndex(imageIndex, EntitytoSpriteKey[buildingType].length)]
    );
  }

  return "";
};

export const getBuildingStorages = (building: Hex, level: bigint) => {
  const resourceStorages = MUDEnums.EResource.map((resource, i) => {
    const storage = comps.P_ByLevelMaxResourceUpgrades.getWithKeys({ prototype: building, level, resource: i })?.value;

    if (!storage) return null;

    return {
      resourceId: resource as Entity,
      resourceType: comps.P_IsUtility.getWithKeys({ id: i }) ? ResourceTypes.Resource : ResourceTypes.Utility,
      amount: storage,
    };
  });

  return resourceStorages.filter((storage) => !!storage) as {
    resourceId: Entity;
    resourceType: ResourceTypes;
    amount: bigint;
  }[];
};

export const getBuildingInfo = (building: Entity) => {
  const buildingType = (comps.BuildingType.get(building)?.value ?? singletonEntity) as Hex;
  const buildingTypeEntity = buildingType as Entity;

  const level = comps.Level.get(building)?.value ?? 1n;
  let nextLevel = level + 1n;

  const maxLevel = comps.P_MaxLevel.getWithKeys({ prototype: buildingType })?.value ?? 1n;
  nextLevel = maxLevel > nextLevel ? maxLevel : nextLevel;

  const buildingLevelKeys = { prototype: buildingType, level: level };
  const buildingNextLevelKeys = { prototype: buildingType, level: nextLevel };
  const production = comps.P_Production.getWithKeys(buildingLevelKeys);
  const nextLevelProduction = comps.P_Production.getWithKeys(buildingNextLevelKeys);

  const storages = getBuildingStorages(buildingType, level);
  const nextLevelStorages = getBuildingStorages(buildingType, level);

  const unitProductionMultiplier = comps.P_UnitProdMultiplier.getWithKeys(buildingLevelKeys)?.value;
  const nextLevelUnitProductionMultiplier = comps.P_UnitProdMultiplier.getWithKeys(buildingNextLevelKeys)?.value;

  const upgradeRecipe = getRecipeDifference(
    getRecipe(buildingTypeEntity, level),
    getRecipe(buildingTypeEntity, nextLevel)
  );

  const mainBaseLvlReq = comps.P_RequiredBaseLevel.getWithKeys(buildingNextLevelKeys)?.value ?? 1;

  const position = comps.Position.get(building) ?? { x: 0, y: 0 };

  return {
    buildingType,
    level,
    maxLevel,
    nextLevel,
    buildingName: `${getBlockTypeName(buildingTypeEntity)} ${toRomanNumeral(Number(level))}`,
    imageUri: getBuildingImage(building),
    production,
    storages,
    position,
    unitProductionMultiplier,
    upgrade: {
      production: nextLevelProduction,
      storages: nextLevelStorages,
      recipe: upgradeRecipe,
      mainBaseLvlReq,
      nextLevelUnitProductionMultiplier,
    },
  };
};
