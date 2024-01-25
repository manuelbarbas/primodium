// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";
import { NewBattleResultData } from "codegen/index.sol";
import { S_FleetBattleApplyDamageSystem } from "systems/subsystems/S_FleetBattleApplyDamageSystem.sol";
import { S_FleetBattleResolveRaidSystem } from "systems/subsystems/S_FleetBattleResolveRaidSystem.sol";
import { S_FleetBattleResolveEncryptionSystem } from "systems/subsystems/S_FleetBattleResolveEncryptionSystem.sol";
import { S_ClaimSystem } from "systems/subsystems/S_ClaimSystem.sol";
import { S_ProductionRateSystem } from "systems/subsystems/S_ProductionRateSystem.sol";
import { S_StorageSystem } from "systems/subsystems/S_StorageSystem.sol";
import { S_RewardsSystem } from "systems/subsystems/S_RewardsSystem.sol";
import { S_SpendResourcesSystem } from "systems/subsystems/S_SpendResourcesSystem.sol";

/* --------------------------------- BATTLE --------------------------------- */

function fleetBattleApplyDamage(
  bytes32 battleId,
  bytes32 targetEntity,
  uint256 damage
) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleApplyDamageSystem"),
    abi.encodeCall(S_FleetBattleApplyDamageSystem.applyDamageToWithAllies, (battleId, targetEntity, damage)),
    0
  );
}

function fleetBattleResolveRaid(
  bytes32 battleId,
  bytes32 raider,
  bytes32 target
) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleResolveRaidSystem"),
    abi.encodeCall(S_FleetBattleResolveRaidSystem.resolveBattleRaid, (battleId, raider, target)),
    0
  );
}

function resolveBattleEncryption(bytes32 battleId, NewBattleResultData memory battleResult) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleResolveEncryptionSystem"),
    abi.encodeCall(S_FleetBattleResolveEncryptionSystem.resolveBattleEncryption, (battleId, battleResult)),
    0
  );
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

function spendUpgradeResources(
  bytes32 spaceRockEntity,
  bytes32 unitPrototype,
  uint256 level
) {
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

function receiveRewards(
  bytes32 playerEntity,
  bytes32 spaceRockEntity,
  bytes32 objectivePrototype
) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_RewardsSystem"),
    abi.encodeCall(S_RewardsSystem.receiveRewards, (playerEntity, spaceRockEntity, objectivePrototype)),
    0
  );
}
