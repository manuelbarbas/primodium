import { EResource, MUDEnums } from "contracts/config/enums";
import { Hex } from "viem";

import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { MultiplierStorages, ResourceEntityLookup, ResourceStorages, SPEED_SCALE, UtilityStorages } from "@/lib";
import { Coord, Dimensions, ResourceType, Tables } from "@/lib/types";
import { createBoundsUtils } from "@/utils/core/bounds";
import { createRecipeUtils } from "@/utils/core/recipe";
import { createTileUtils } from "@/utils/core/tile";
import { getEntityTypeName, toRomanNumeral } from "@/utils/global/common";

export function createBuildingUtils(tables: Tables) {
  const { outOfBounds } = createBoundsUtils(tables);
  const { getRecipe } = createRecipeUtils(tables);
  const { getResourceKey, getBuildingAtCoord } = createTileUtils(tables);
  const blueprintCache = new Map<Entity, Dimensions>();

  /**
   * Gets the dimensions of a building
   *
   * @param entity Building entity
   * @param coordinates Coordinates of the building
   */
  function calcDims(entity: Entity, coordinates: Coord[]): Dimensions {
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

  /**
   * Converts a string of [x1, y1, x2, y2, ...] to an array of [{x: x1, y: y1}, {x: x2, y: y2}, ...]
   *
   * @param numbers Array of numbers
   * @returns Array of coordinates
   */
  function convertToCoords(numbers: number[]): Coord[] {
    if (numbers.length % 2 !== 0) {
      throw new Error("Input array must contain an even number of elements");
    }

    const coordinates: Coord[] = [];

    for (let i = 0; i < numbers.length; i += 2) {
      coordinates.push({ x: numbers[i], y: numbers[i + 1] });
    }

    return coordinates;
  }

  /**
   * Converts relative coordinates to absolute coordinates from given origin
   *
   * @param coordinates Coordinates to convert
   * @param origin Origin of the coordinates
   * @returns Converted coordinates
   */
  function relCoordToAbs(coordinates: Coord[], origin: Coord): Coord[] {
    return coordinates.map((coord) => ({
      x: coord.x + origin.x,
      y: coord.y + origin.y,
    }));
  }

  /**
   * Gets the origin of a building from a source coordinate
   *
   * @param source Source coordinate
   * @param building Building entity
   * @returns Origin of the building relative to the source (if building exists at source)
   */
  function getBuildingOrigin(source: Coord, building: Entity): Coord | undefined {
    const blueprint = tables.P_Blueprint.get(building)?.value;
    if (!blueprint) return;
    const topLeftCoord = getTopLeftCoord(convertToCoords(blueprint));

    if (!blueprint) return;
    return { x: source.x - topLeftCoord.x, y: source.y - topLeftCoord.y };
  }

  /** Gets the top left coordinate of a building from a source coordinate */
  function getBuildingTopLeft(origin: Coord, buildingType: Entity): Coord {
    const rawBlueprint = tables.P_Blueprint.get(buildingType)?.value;
    if (!rawBlueprint) throw new Error("No blueprint found");

    const relativeTopLeft = getTopLeftCoord(convertToCoords(rawBlueprint));

    return { x: origin.x + relativeTopLeft.x, y: origin.y + relativeTopLeft.y };
  }
  /** Gets the bottom left coordinate of a building from a source coordinate */
  function getBuildingBottomLeft(origin: Coord, buildingType: Entity) {
    const rawBlueprint = tables.P_Blueprint.get(buildingType)?.value;
    if (!rawBlueprint) throw new Error("No blueprint found");

    const relativeBottomLeft = getBottomLeftCoord(convertToCoords(rawBlueprint));

    return { x: origin.x + relativeBottomLeft.x, y: origin.y + relativeBottomLeft.y };
  }
  function getTopLeftCoord(coordinates: Coord[]): Coord {
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

  function getBottomLeftCoord(coordinates: Coord[]): Coord {
    if (coordinates.length === 0) throw new Error("Cannot get bottom left coordinate of empty array");
    if (coordinates.length === 1) return coordinates[0];

    let minX = coordinates[0].x;
    let minY = coordinates[0].y;

    for (let i = 1; i < coordinates.length; i++) {
      minX = Math.min(minX, coordinates[i].x);
      minY = Math.min(minY, coordinates[i].y);
    }

    return { x: minX, y: minY };
  }

  /**
   * Gets the dimensions of a building
   *
   * @param entity Building entity
   * @param coordinates Coordinates of the building
   */
  function getBuildingDimensions(building: Entity) {
    const blueprint = tables.P_Blueprint.get(building)?.value;

    const dimensions = blueprint ? calcDims(building, convertToCoords(blueprint)) : { width: 1, height: 1 };

    return dimensions;
  }

  /**
   * Validates if a building can be placed at a given coordinate
   *
   * @param coord Coordinate to place building
   * @param buildingPrototype Type of building to place
   * @param asteroid Asteroid entity
   * @param building Building entity (if updating)
   */
  const validateBuildingPlacement = (coord: Coord, buildingPrototype: Entity, asteroid: Entity, building?: Entity) => {
    //get building dimesions
    const buildingDimensions = getBuildingDimensions(buildingPrototype);
    const requiredTile = tables.P_RequiredTile.get(buildingPrototype)?.value;

    //iterate over dimensions and check if there is a building there
    for (let x = 0; x < buildingDimensions.width; x++) {
      for (let y = 0; y < buildingDimensions.height; y++) {
        const buildingCoord = { x: coord.x + x, y: coord.y - y };
        const buildingAtCoord = getBuildingAtCoord(buildingCoord, asteroid);
        if (buildingAtCoord && buildingAtCoord !== building) return false;
        if (outOfBounds(buildingCoord, asteroid)) return false;
        const mapId = tables.Asteroid.get(asteroid)?.mapId ?? 1;
        if (requiredTile && requiredTile !== getResourceKey(buildingCoord, mapId)) return false;
      }
    }

    return true;
  };

  /**
   * Gets building name from building entity
   *
   * @param building Entity
   * @returns Building name
   */
  const getBuildingName = (building: Entity): string => {
    const buildingType = tables.BuildingType.get(building)?.value as Entity;
    const level = tables.Level.get(building)?.value ?? 1n;

    if (!buildingType) return "";

    return `${getEntityTypeName(buildingType)} ${toRomanNumeral(Number(level))}`;
  };

  /**
   * Gets max storage of all resources a building can hold
   *
   * @param buildingType Building entity
   * @param level Building level
   */
  const getBuildingStorages = (buildingType: Entity, level: bigint): ResourceData[] => {
    const resourceStorages = MUDEnums.EResource.map((_, i) => {
      const storage = tables.P_ByLevelMaxResourceUpgrades.getWithKeys({
        prototype: buildingType as Hex,
        level,
        resource: i,
      })?.value;

      if (!storage) return null;

      return {
        resource: ResourceEntityLookup[i as EResource],
        type: tables.P_IsUtility.getWithKeys({ id: i }) ? ResourceType.Resource : ResourceType.Utility,
        amount: storage,
      };
    });

    return resourceStorages.filter((storage) => !!storage);
  };

  /** Gets upgrades of building storage at a given level */
  function getBuildingLevelStorageUpgrades(buildingType: Entity, level: bigint) {
    const storageUpgrade = tables.P_ListMaxResourceUpgrades.getWithKeys({
      prototype: buildingType as Hex,
      level: level,
    })?.value as EResource[] | undefined;
    if (!storageUpgrade) return [];
    return storageUpgrade.map((resource) => ({
      resource: ResourceEntityLookup[resource],
      amount:
        tables.P_ByLevelMaxResourceUpgrades.getWithKeys({ prototype: buildingType as Hex, level, resource })?.value ??
        0n,
    }));
  }

  type ResourceData = { resource: Entity; amount: bigint; type: ResourceType };
  function transformProductionData(production: { resources: number[]; amounts: bigint[] } | undefined): ResourceData[] {
    if (!production) return [];

    return production.resources
      .map((curr, i) => {
        const resourceEntity = ResourceEntityLookup[curr as EResource];
        const type = ResourceStorages.has(resourceEntity)
          ? ResourceType.ResourceRate
          : UtilityStorages.has(resourceEntity)
            ? ResourceType.Utility
            : MultiplierStorages.has(resourceEntity)
              ? ResourceType.Multiplier
              : null;

        if (type === null) return null;

        let amount = production.amounts[i];
        if (type === ResourceType.ResourceRate) {
          const worldSpeed = tables.P_GameConfig.get()?.worldSpeed ?? 100n;
          amount = (amount * worldSpeed) / SPEED_SCALE;
        }

        return {
          resource: ResourceEntityLookup[curr as EResource],
          amount,
          type,
        };
      })
      .filter((item) => item !== null) as { resource: Entity; amount: bigint; type: ResourceType }[];
  }

  /**
   * Gets bundle of building info
   *
   * @param building Building entity
   */
  const getBuildingInfo = (building: Entity) => {
    const buildingType = tables.BuildingType.get(building)?.value as Hex | undefined;
    if (!buildingType) throw new Error("No building type found");
    const buildingTypeEntity = buildingType as Entity;

    const level = tables.Level.get(building)?.value ?? 1n;
    const buildingLevelKeys = { prototype: buildingType, level: level };
    const production = transformProductionData(tables.P_Production.getWithKeys(buildingLevelKeys));
    const productionDep = tables.P_RequiredDependency.getWithKeys(buildingLevelKeys);

    const requiredDependencies = transformProductionData({
      resources: productionDep ? [productionDep.resource] : [],
      amounts: productionDep ? [productionDep.amount] : [],
    });
    const unitProduction = tables.P_UnitProdTypes.getWithKeys(buildingLevelKeys)?.value;
    const storages = getBuildingStorages(buildingTypeEntity, level);
    const unitProductionMultiplier = tables.P_UnitProdMultiplier.getWithKeys(buildingLevelKeys)?.value;
    const position = (tables.Position.get(building) ?? { x: 0, y: 0, parentEntity: defaultEntity }) as Coord & {
      parentEntity: Entity;
    };

    const nextLevel = level + 1n;
    const maxLevel = tables.P_MaxLevel.getWithKeys({ prototype: buildingType })?.value ?? 1n;

    let nextLevelData = undefined;
    if (nextLevel <= maxLevel) {
      const buildingNextLevelKeys = { prototype: buildingType, level: nextLevel };
      const nextLevelProduction = transformProductionData(tables.P_Production.getWithKeys(buildingNextLevelKeys));
      const nextLevelProductionDep = tables.P_RequiredDependency.getWithKeys(buildingNextLevelKeys);
      const nextLevelRequiredDependencies = transformProductionData({
        resources: nextLevelProductionDep ? [nextLevelProductionDep.resource] : [],
        amounts: nextLevelProductionDep ? [nextLevelProductionDep.amount] : [],
      });
      const unitNextLevelProduction = tables.P_UnitProdTypes.getWithKeys(buildingNextLevelKeys)?.value;
      const nextLevelStorages = getBuildingStorages(buildingTypeEntity, nextLevel);
      const nextLevelUnitProductionMultiplier = tables.P_UnitProdMultiplier.getWithKeys(buildingNextLevelKeys)?.value;
      const upgradeRecipe = getRecipe(buildingTypeEntity, nextLevel);
      const mainBaseLvlReq = tables.P_RequiredBaseLevel.getWithKeys(buildingNextLevelKeys)?.value ?? 1;
      nextLevelData = {
        unitProduction: unitNextLevelProduction,
        production: nextLevelProduction,
        storages: nextLevelStorages,
        recipe: upgradeRecipe,
        mainBaseLvlReq,
        nextLevelUnitProductionMultiplier,
        requiredDependencies: nextLevelRequiredDependencies,
      };
    }

    return {
      buildingType,
      level,
      maxLevel,
      nextLevel,
      production,
      unitProduction,
      storages,
      position,
      unitProductionMultiplier,
      requiredDependencies,
      upgrade: nextLevelData,
    };
  };

  return {
    convertToCoords,
    relCoordToAbs,
    getBuildingOrigin,
    getBuildingDimensions,
    getBuildingName,
    getBuildingStorages,
    getBuildingLevelStorageUpgrades,
    validateBuildingPlacement,
    transformProductionData,
    getBuildingInfo,
    getBuildingTopLeft,
    getBuildingBottomLeft,
  };
}
