// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { IsFleet, NewBattleResult, NewBattleResultData, FleetMovement, P_GracePeriod } from "codegen/index.sol";
import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";
import { fleetBattleResolveRaid, fleetBattleApplyDamage, resolveBattleEncryption } from "libraries/SubsystemCalls.sol";

contract FleetCombatSystem is FleetBaseSystem {
  function fleetAttackFleet(bytes32 fleetId, bytes32 targetFleet)
    public
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    NewBattleResultData memory batteResult = LibFleetCombat.fleetAttackFleet(_player(), fleetId, targetFleet);

    afterBattle(batteResult);
  }

  function fleetAttackSpaceRock(bytes32 fleetId, bytes32 targetSpaceRock)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, targetSpaceRock)
  {
    NewBattleResultData memory batteResult = LibFleetCombat.fleetAttackSpaceRock(_player(), fleetId, targetSpaceRock);

    afterBattle(batteResult);
  }

  function spaceRockAttackFleet(bytes32 spaceRock, bytes32 targetFleet)
    public
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(targetFleet, spaceRock)
  {
    NewBattleResultData memory batteResult = LibFleetCombat.spaceRockAttackFleet(_player(), spaceRock, targetFleet);
    afterBattle(batteResult);
  }

  function afterBattle(NewBattleResultData memory battleResult) internal {
    fleetBattleApplyDamage(battleResult.aggressorEntity, battleResult.targetDamage);

    if (battleResult.winner == battleResult.aggressorEntity) {
      fleetBattleResolveRaid(battleResult.aggressorEntity, battleResult.targetEntity);

      if (!IsFleet.get(battleResult.targetEntity)) {
        resolveBattleEncryption(battleResult);
      }
    }

    fleetBattleApplyDamage(battleResult.targetEntity, battleResult.aggressorDamage);
  }

  modifier _onlyWhenNotInGracePeriod(bytes32 fleetId) {
    require(
      !((FleetMovement.getArrivalTime(fleetId) + P_GracePeriod.getFleet()) <= block.timestamp),
      "[Fleet] Target fleet is in grace period"
    );
    _;
  }
}
