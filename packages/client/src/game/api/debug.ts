import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Position } from "src/network/components/clientComponents";
import { Network } from "src/network/layer";
import {
  debugAcquireResources,
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
    const entities = Position.getAllWith(coord);

    if (entities.length == 0) return;

    return entities[0];
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
