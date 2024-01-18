// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";
import { S_FleetBattleApplyDamageSystem } from "systems/subsystems/S_FleetBattleApplyDamageSystem.sol";
import { S_FleetBattleResolveRaidSystem } from "systems/subsystems/S_FleetBattleResolveRaidSystem.sol";

function fleetBattleApplyDamage(bytes32 targetEntity, uint256 damage) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleApplyDamageSystem"),
    abi.encodeCall(S_FleetBattleApplyDamageSystem.applyDamageToWithAllies, (targetEntity, damage)),
    0
  );
}

function fleetBattleResolveRaid(bytes32 raider, bytes32 target) {
  SystemCall.callWithHooksOrRevert(
    DUMMY_ADDRESS,
    getSystemResourceId("S_FleetBattleResolveRaidSystem"),
    abi.encodeCall(S_FleetBattleResolveRaidSystem.resolveBattleRaid, (raider, target)),
    0
  );
}
