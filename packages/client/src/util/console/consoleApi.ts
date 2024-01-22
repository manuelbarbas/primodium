import { Primodium } from "@game/api";
import { Entity } from "@latticexyz/recs";
import _ from "lodash";
import { components } from "src/network/components";
import { grantAccess, revokeAccess, revokeAllAccess, switchDelegate } from "src/network/setup/contractCalls/access";
import {
  acceptJoinRequest,
  createAlliance,
  declineInvite,
  grantRole,
  invite,
  joinAlliance,
  kickPlayer,
  leaveAlliance,
  rejectJoinRequest,
  requestToJoin,
} from "src/network/setup/contractCalls/alliance";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { claimObjective } from "src/network/setup/contractCalls/claimObjective";
import { claimUnits } from "src/network/setup/contractCalls/claimUnits";
import { demolishBuilding } from "src/network/setup/contractCalls/demolishBuilding";
import { invade } from "src/network/setup/contractCalls/invade";
import { moveBuilding } from "src/network/setup/contractCalls/moveBuilding";
import { raid } from "src/network/setup/contractCalls/raid";
import { recallArrival, recallStationedUnits } from "src/network/setup/contractCalls/recall";
import { reinforce } from "src/network/setup/contractCalls/reinforce";
import { send } from "src/network/setup/contractCalls/send";
import { toggleBuilding } from "src/network/setup/contractCalls/toggleBuilding";
import { train } from "src/network/setup/contractCalls/train";
import { upgradeBuilding } from "src/network/setup/contractCalls/upgradeBuilding";
import { upgradeRange } from "src/network/setup/contractCalls/upgradeRange";
import { upgradeUnit } from "src/network/setup/contractCalls/upgradeUnit";
import { MUD } from "src/network/types";
import { getAllianceName, getAllianceNameFromPlayer } from "../alliance";
import {
  calcDims,
  getBuildingDimensions,
  getBuildingImage,
  getBuildingImageFromType,
  getBuildingInfo,
  getBuildingLevelStorageUpgrades,
  getBuildingName,
  getBuildingOrigin,
  getBuildingStorages,
  relCoordToAbs,
} from "../building";
import { entityToColor } from "../color";
import { findEntriesWithPrefix, getPrivateKey } from "../localStorage";
import { entityToPlayerName, entityToRockName, playerNameToEntity, rockNameToEntity } from "../name";
import { getCanClaimObjective, getIsObjectiveAvailable } from "../objectives";
import { getAsteroidBounds, getAsteroidMaxBounds, outOfBounds } from "../outOfBounds";
import { getRecipe, getRecipeDifference } from "../recipe";
import {
  getAsteroidResourceCount,
  getFullResourceCount,
  getFullResourceCounts,
  getScale,
  isUtility,
} from "../resource";
import { getRewards } from "../reward";
import { getMoveLength, getSlowestUnitSpeed } from "../send";
import { getRockRelationship, getSpaceRockImage, getSpaceRockInfo, getSpaceRockName } from "../spacerock";
import { getBuildingAtCoord, getBuildingsOfTypeInRange } from "../tile";
import { getUnitStats, getUnitTrainingTime } from "../trainUnits";
import { getUpgradeInfo } from "../upgrade";
import { solCos, solCosDegrees, solSin, solSinDegrees } from "../vector";

export default function createConsoleApi(mud: MUD, primodium: Primodium) {
  const utils = {
    alliance: {
      getAllianceName,
      getAllianceNameFromPlayer,
    },
    building: {
      calcDims,
      relCoordToAbs,
      getBuildingOrigin,
      getBuildingDimensions,
      getBuildingName,
      getBuildingImage: (building: Entity) => getBuildingImage(primodium, building),
      getBuildingImageFromType: (buildingType: Entity) => getBuildingImageFromType(primodium, buildingType),
      getBuildingStorages,
      getBuildingLevelStorageUpgrades,
      getBuildingInfo,
      getBuildingAtCoord,
      getBuildingsOfTypeInRange,
    },
    color: {
      entityToColor,
    },
    localStorage: {
      findEntriesWithPrefix,
      getPrivateKey,
    },
    name: {
      entityToPlayerName,
      entityToRockName,
      playerNameToEntity,
      rockNameToEntity,
    },
    objective: {
      getIsObjectiveAvailable,
      getCanClaimObjective,
    },
    bounds: {
      outOfBounds,
      getAsteroidBounds,
      getAsteroidMaxBounds,
    },
    recipe: {
      getRecipe,
      getRecipeDifference,
    },
    resource: {
      getScale,
      isUtility,
      getFullResourceCount,
      getAsteroidResourceCount,
      getFullResourceCounts,
    },
    reward: {
      getRewards,
    },
    sendUtils: {
      getMoveLength,
      getSlowestUnitSpeed,
    },
    spaceRock: {
      getSpaceRockImage: (rock: Entity) => getSpaceRockImage(primodium, rock),
      getSpaceRockName,
      getSpaceRockInfo: (rock: Entity) => getSpaceRockInfo(primodium, rock),
      getRockRelationship,
    },
    units: {
      getUnitStats,
      getUnitTrainingTime,
    },
    upgrade: {
      getUpgradeInfo,
    },
    vector: {
      solSin,
      solCos,
      solSinDegrees,
      solCosDegrees,
    },
  };

  const contractCalls = {
    grantAccess: _.curry(grantAccess)(mud),
    revokeAccess: _.curry(revokeAccess)(mud),
    revokeAllAccess: () => revokeAllAccess(mud),
    switchDelegate: _.curry(switchDelegate)(mud),

    createAlliance: _.curry(createAlliance)(mud),
    leaveAlliance: () => leaveAlliance(mud),
    joinAlliance: _.curry(joinAlliance)(mud),
    declineInvite: _.curry(declineInvite)(mud),
    requestToJoin: _.curry(requestToJoin)(mud),
    kickPlayer: _.curry(kickPlayer)(mud),
    grantRole: _.curry(grantRole)(mud),
    acceptJoinRequest: _.curry(acceptJoinRequest)(mud),
    rejectJoinRequest: _.curry(rejectJoinRequest)(mud),
    invite: _.curry(invite)(mud),

    buildBuilding: _.curry(buildBuilding)(mud),

    claimObjective: _.curry(claimObjective)(mud),
    claimUnits: _.curry(claimUnits)(mud),
    demolishBuilding: _.curry(demolishBuilding)(mud),
    invade: _.curry(invade)(mud),
    moveBuilding: _.curry(moveBuilding)(mud),
    raid: _.curry(raid)(mud),
    recallArrival: _.curry(recallArrival)(mud),
    recallStationedUnits: _.curry(recallStationedUnits)(mud),
    reinforce: _.curry(reinforce)(mud),
    send: _.curry(send)(mud),
    toggleBuilding: _.curry(toggleBuilding)(mud),
    train: _.curry(train)(mud),
    upgradeBuilding: _.curry(upgradeBuilding)(mud),
    upgradeRange: _.curry(upgradeRange)(mud),
    upgradeUnit: _.curry(upgradeUnit)(mud),
  };
  const ret = {
    priPlayerAccount: mud.playerAccount,
    priComponents: components,
    priContractCalls: contractCalls,
    priUtils: utils,
  };
  return ret;
}
