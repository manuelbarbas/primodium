// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { getSystemResourceId, entityToAddress } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";
import { Position, PositionData } from "codegen/index.sol";
import { EBuilding } from "src/Types.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { S_InitializeSpaceRockOwnershipSystem } from "systems/subsystems/S_InitializeSpaceRockOwnershipSystem.sol";
import { S_TransferSpaceRockOwnershipSystem } from "systems/subsystems/S_TransferSpaceRockOwnershipSystem.sol";
import { S_FleetBattleApplyDamageSystem } from "systems/subsystems/S_FleetBattleApplyDamageSystem.sol";
import { S_FleetBattleResolveRaidSystem } from "systems/subsystems/S_FleetBattleResolveRaidSystem.sol";
import { S_FleetBattleResolveEncryptionSystem } from "systems/subsystems/S_FleetBattleResolveEncryptionSystem.sol";
import { S_FleetResetIfNoUnitsLeftSystem } from "systems/subsystems/S_FleetResetIfNoUnitsLeftSystem.sol";
import { S_FleetResolvePirateAsteroidSystem } from "systems/subsystems/S_FleetResolvePirateAsteroidSystem.sol";
import { S_CreateSecondaryAsteroidSystem } from "systems/subsystems/S_CreateSecondaryAsteroidSystem.sol";
import { S_ClaimSystem } from "systems/subsystems/S_ClaimSystem.sol";
import { S_ProductionRateSystem } from "systems/subsystems/S_ProductionRateSystem.sol";
import { S_StorageSystem } from "systems/subsystems/S_StorageSystem.sol";
import { S_RewardsSystem } from "systems/subsystems/S_RewardsSystem.sol";
import { S_SpendResourcesSystem } from "systems/subsystems/S_SpendResourcesSystem.sol";

/* --------------------------------- BATTLE --------------------------------- */

function fleetBattleApplyDamage(
  bytes32 battleId,
  bytes32 damageDealerPlayerEntity,
  bytes32 targetEntity,
  uint256 damage
) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleApplyDamageSystem"),
    abi.encodeCall(
      S_FleetBattleApplyDamageSystem.applyDamageToWithAllies,
      (battleId, damageDealerPlayerEntity, targetEntity, damage)
    ),
    0
  );
}

function fleetBattleResolveRaid(bytes32 battleId, bytes32 raider, bytes32 target) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleResolveRaidSystem"),
    abi.encodeCall(S_FleetBattleResolveRaidSystem.resolveBattleRaid, (battleId, raider, target)),
    0
  );
}

function fleetResolveBattleEncryption(
  bytes32 battleId,
  bytes32 targetSpaceRock,
  bytes32 aggressorEntity,
  bytes32 unitWithDecryptionPrototype,
  uint256 decryption
) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleResolveEncryptionSystem"),
    abi.encodeCall(
      S_FleetBattleResolveEncryptionSystem.resolveBattleEncryption,
      (battleId, targetSpaceRock, aggressorEntity, unitWithDecryptionPrototype, decryption)
    ),
    0
  );
}

function fleetResolvePirateAsteroid(bytes32 playerEntity, bytes32 pirateAsteroid) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetResolvePirateAsteroidSystem"),
    abi.encodeCall(S_FleetResolvePirateAsteroidSystem.resolvePirateAsteroid, (playerEntity, pirateAsteroid)),
    0
  );
}

function resetFleetIfNoUnitsLeft(bytes32 fleetId) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetResetIfNoUnitsLeftSystem"),
    abi.encodeCall(S_FleetResetIfNoUnitsLeftSystem.resetFleetIfNoUnitsLeft, (fleetId)),
    0
  );
}

/* --------------------------------- ASTEROID --------------------------------- */

function transferSpaceRockOwnership(bytes32 spaceRock, bytes32 newOwner) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_TransferSpaceRockOwnershipSystem"),
    abi.encodeCall(S_TransferSpaceRockOwnershipSystem.transferSpaceRockOwnership, (spaceRock, newOwner)),
    0
  );
}

function initializeSpaceRockOwnership(bytes32 spaceRock, bytes32 owner) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_InitializeSpaceRockOwnershipSystem"),
    abi.encodeCall(S_InitializeSpaceRockOwnershipSystem.initializeSpaceRockOwnership, (spaceRock, owner)),
    0
  );
}

function buildMainBase(bytes32 playerEntity, bytes32 spaceRock) {
  PositionData memory position = Position.get(MainBasePrototypeId);
  position.parent = spaceRock;
  SystemCall.callWithHooksOrRevert(
    entityToAddress(playerEntity),
    getSystemResourceId("BuildSystem"),
    abi.encodeCall(BuildSystem.build, (EBuilding.MainBase, position)),
    0
  );
}

function createSecondaryAsteroid(PositionData memory position) returns (bytes32) {
  bytes memory rawAsteroid = SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_CreateSecondaryAsteroidSystem"),
    abi.encodeCall(S_CreateSecondaryAsteroidSystem.createSecondaryAsteroid, (position)),
    0
  );
  return abi.decode(rawAsteroid, (bytes32));
}

/* --------------------------------- GLOBAL --------------------------------- */
function claimResources(bytes32 spaceRockEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_ClaimSystem"),
    abi.encodeCall(S_ClaimSystem.claimResources, (spaceRockEntity)),
    0
  );
}

function claimUnits(bytes32 spaceRockEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_ClaimSystem"),
    abi.encodeCall(S_ClaimSystem.claimUnits, (spaceRockEntity)),
    0
  );
}

/* ------------------------------- PRODUCTION ------------------------------- */

function upgradeProductionRate(bytes32 buildingEntity, uint256 level) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_ProductionRateSystem"),
    abi.encodeCall(S_ProductionRateSystem.upgradeProductionRate, (buildingEntity, level)),
    0
  );
}

function toggleProductionRate(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_ProductionRateSystem"),
    abi.encodeCall(S_ProductionRateSystem.toggleProductionRate, (buildingEntity)),
    0
  );
}

function clearProductionRate(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_ProductionRateSystem"),
    abi.encodeCall(S_ProductionRateSystem.clearProductionRate, (buildingEntity)),
    0
  );
}

/* ------------------------------- MAX STORAGE ------------------------------ */

function increaseMaxStorage(bytes32 buildingEntity, uint256 level) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_StorageSystem"),
    abi.encodeCall(S_StorageSystem.increaseMaxStorage, (buildingEntity, level)),
    0
  );
}

function clearMaxStorageIncrease(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_StorageSystem"),
    abi.encodeCall(S_StorageSystem.clearMaxStorageIncrease, (buildingEntity)),
    0
  );
}

function toggleMaxStorage(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_StorageSystem"),
    abi.encodeCall(S_StorageSystem.toggleMaxStorage, (buildingEntity)),
    0
  );
}

/* --------------------------- RESOURCE & UTILITY --------------------------- */

function spendBuildingRequiredResources(bytes32 buildingEntity, uint256 level) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_SpendResourcesSystem"),
    abi.encodeCall(S_SpendResourcesSystem.spendBuildingRequiredResources, (buildingEntity, level)),
    0
  );
}

function spendUpgradeResources(bytes32 spaceRockEntity, bytes32 unitPrototype, uint256 level) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_SpendResourcesSystem"),
    abi.encodeCall(S_SpendResourcesSystem.spendUpgradeResources, (spaceRockEntity, unitPrototype, level)),
    0
  );
}

function toggleBuildingUtility(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_SpendResourcesSystem"),
    abi.encodeCall(S_SpendResourcesSystem.toggleBuildingUtility, (buildingEntity)),
    0
  );
}

function clearUtilityUsage(bytes32 buildingEntity) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_SpendResourcesSystem"),
    abi.encodeCall(S_SpendResourcesSystem.clearUtilityUsage, (buildingEntity)),
    0
  );
}

/* --------------------------------- REWARDS -------------------------------- */

function receiveRewards(bytes32 playerEntity, bytes32 spaceRockEntity, bytes32 objectivePrototype) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_RewardsSystem"),
    abi.encodeCall(S_RewardsSystem.receiveRewards, (playerEntity, spaceRockEntity, objectivePrototype)),
    0
  );
}
