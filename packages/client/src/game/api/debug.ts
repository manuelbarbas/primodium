import { EntityID, EntityIndex, getEntitiesWithValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Network } from "src/network/layer";
import {
  debugAcquireResources,
  debugAcquireResourcesBasedOnRequirement,
  debugAcquireStorageForAllResources,
  debugIgnoreBuildLimitForBuilding,
  debugRemoveBuildLimit,
  debugRemoveUpgradeRequirements,
  debugRemoveBuildingRequirements,
} from "src/util/web3";

export const debug = (network: Network) => {
  const acquireResources = async (resourceId: EntityID, amount: number) => {
    await debugAcquireResources(resourceId, amount, network);
  };

  const acquireResourcesBasedOnRequirement = async (entity: EntityID) => {
    await debugAcquireResourcesBasedOnRequirement(entity, network);
  };

  const acquireStorageForAllResources = async () => {
    await debugAcquireStorageForAllResources(network);
  };

  const removeBuildLimit = async () => {
    await debugRemoveBuildLimit(network);
  };

  const removeUpgradeRequirements = async (buildingId: EntityID) => {
    await debugRemoveUpgradeRequirements(buildingId, network);
  };

  const removeBuildingRequirements = async (buildingId: EntityID) => {
    await debugRemoveBuildingRequirements(buildingId, network);
  };

  const ignoreBuildLimitForBuilding = async (buildingId: EntityID) => {
    await debugIgnoreBuildLimitForBuilding(buildingId, network);
  };

  const getEntityIdAtCoord = (coord: Coord) => {
    const { components, world } = network;
    const entity = getEntitiesWithValue(components.Position, coord);

    const entityIndex = entity.values().next().value as EntityIndex;

    return world.entities[entityIndex];
  };

  return {
    acquireResources,
    acquireResourcesBasedOnRequirement,
    acquireStorageForAllResources,
    removeBuildLimit,
    removeUpgradeRequirements,
    removeBuildingRequirements,
    ignoreBuildLimitForBuilding,
    getEntityIdAtCoord,
  };
};
