import { WorldAbiType } from "@/lib";
import { getSystemId } from "@/utils";
import { ContractFunctionName, Hex } from "viem";

export const functionSystemIds: {
  [functionName in ContractFunctionName<WorldAbiType>]?: Hex;
} = {
  /* ------------------------------- Delegation ------------------------------- */
  // callWithSignature: getSystemId("Registration", "CORE"),
  registerDelegation: getSystemId("Registration", "CORE"),
  unregisterDelegation: getSystemId("Registration", "CORE"),

  /* -------------------------------- Alliance -------------------------------- */
  Pri_11__create: getSystemId("AllianceSystem"),
  Pri_11__setAllianceName: getSystemId("AllianceSystem"),
  Pri_11__setAllianceInviteMode: getSystemId("AllianceSystem"),

  Pri_11__join: getSystemId("AllianceSystem"),
  Pri_11__leave: getSystemId("AllianceSystem"),
  Pri_11__invite: getSystemId("AllianceSystem"),
  Pri_11__revokeInvite: getSystemId("AllianceSystem"),
  Pri_11__declineInvite: getSystemId("AllianceSystem"),
  Pri_11__kick: getSystemId("AllianceSystem"),
  Pri_11__grantRole: getSystemId("AllianceSystem"),
  Pri_11__requestToJoin: getSystemId("AllianceSystem"),
  Pri_11__rejectRequestToJoin: getSystemId("AllianceSystem"),
  Pri_11__acceptRequestToJoin: getSystemId("AllianceSystem"),

  Pri_11__abandonAsteroid: getSystemId("AbandonAsteroidSystem"),

  Pri_11__claimObjective: getSystemId("ClaimObjectiveSystem"),

  Pri_11__payForMaxColonySlots: getSystemId("ColonySystem"),
  Pri_11__changeHome: getSystemId("ColonySystem"),

  Pri_11__attack: getSystemId("CombatSystem"),

  Pri_11__devSetRecord: getSystemId("DevSystem"),
  Pri_11__devSetField: getSystemId("DevSystem"),
  Pri_11__devSetStaticField: getSystemId("DevSystem"),
  Pri_11__devSetDynamicField: getSystemId("DevSystem"),
  Pri_11__devSpliceDynamicData: getSystemId("DevSystem"),
  Pri_11__devSpliceStaticData: getSystemId("DevSystem"),
  Pri_11__devPushToDynamicField: getSystemId("DevSystem"),
  Pri_11__devPopFromDynamicField: getSystemId("DevSystem"),
  Pri_11__devDeleteRecord: getSystemId("DevSystem"),

  Pri_11__increment: getSystemId("IncrementSystem"),

  Pri_11__toggleMarketplaceLock: getSystemId("MarketplaceSystem"),
  Pri_11__addLiquidity: getSystemId("MarketplaceSystem"),
  Pri_11__removeLiquidity: getSystemId("MarketplaceSystem"),
  Pri_11__swap: getSystemId("MarketplaceSystem"),

  Pri_11__spawn: getSystemId("SpawnSystem"),

  Pri_11__trainUnits: getSystemId("TrainUnitsSystem"),

  Pri_11__upgradeRange: getSystemId("UpgradeRangeSystem"),

  Pri_11__upgradeUnit: getSystemId("UpgradeUnitSystem"),

  Pri_11__build: getSystemId("BuildSystem"),

  Pri_11__destroy: getSystemId("DestroySystem"),

  Pri_11__moveBuilding: getSystemId("MoveBuildingSystem"),

  Pri_11__toggleBuilding: getSystemId("ToggleBuildingSystem"),

  Pri_11__upgradeBuilding: getSystemId("UpgradeBuildingSystem"),

  Pri_11__abandonFleet: getSystemId("FleetClearSystem"),
  Pri_11__clearUnits: getSystemId("FleetClearSystem"),
  Pri_11__clearResources: getSystemId("FleetClearSystem"),
  Pri_11__clearUnitsAndResourcesFromFleet: getSystemId("FleetClearSystem"),

  Pri_11__createFleet: getSystemId("FleetCreateSystem"),

  Pri_11__landFleet: getSystemId("FleetLandSystem"),

  Pri_11__mergeFleets: getSystemId("FleetMergeSystem"),

  Pri_11__recallFleet: getSystemId("FleetRecallSystem"),

  Pri_11__sendFleet: getSystemId("FleetSendSystem"),

  Pri_11__clearFleetStance: getSystemId("FleetStanceSystem"),
  Pri_11__setFleetStance: getSystemId("FleetStanceSystem"),

  Pri_11__claimUnits: getSystemId("S_ClaimSystem"),
  Pri_11__claimResources: getSystemId("S_ClaimSystem"),

  Pri_11__transferUnitsAndResourcesFromAsteroidToFleet: getSystemId("TransferSystem"),
  Pri_11__transferUnitsAndResourcesFromFleetToFleet: getSystemId("TransferSystem"),
  Pri_11__transferUnitsAndResourcesFromFleetToAsteroid: getSystemId("TransferSystem"),
  Pri_11__transferUnitsFromFleetToAsteroid: getSystemId("TransferSystem"),
  Pri_11__transferUnitsFromFleetToFleet: getSystemId("TransferSystem"),
  Pri_11__transferUnitsFromAsteroidToFleet: getSystemId("TransferSystem"),
  Pri_11__transferResourcesFromAsteroidToFleet: getSystemId("TransferSystem"),
  Pri_11__transferResourcesFromFleetToFleet: getSystemId("TransferSystem"),
  Pri_11__transferResourcesFromFleetToAsteroid: getSystemId("TransferSystem"),

  Pri_11__transferResourcesTwoWay: getSystemId("TransferTwoWaySystem"),
  Pri_11__transferUnitsAndResourcesTwoWay: getSystemId("TransferTwoWaySystem"),
  Pri_11__transferUnitsTwoWay: getSystemId("TransferTwoWaySystem"),

  Pri_11__claimPrimodium: getSystemId("ClaimPrimodiumSystem"),
  Pri_11__claimShardAsteroidPoints: getSystemId("ClaimPrimodiumSystem"),

  Pri_11__wormholeDeposit: getSystemId("WormholeDepositSystem"),
};
