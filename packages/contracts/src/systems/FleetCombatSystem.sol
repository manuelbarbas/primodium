// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { FleetStance, IsFleet, NewBattleResult, NewBattleResultData, FleetMovement, P_GracePeriod } from "codegen/index.sol";
import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { EFleetStance } from "src/Types.sol";
import { fleetBattleResolveRaid, fleetBattleApplyDamage, resolveBattleEncryption } from "libraries/SubsystemCalls.sol";

contract FleetCombatSystem is FleetBaseSystem {
  modifier _onlyWhenNotInGracePeriod(bytes32 fleetId) {
    require(
      !((FleetMovement.getArrivalTime(fleetId) + P_GracePeriod.getFleet()) <= block.timestamp),
      "[Fleet] Target fleet is in grace period"
    );
    _;
  }

  modifier _onlyWhenNotInStance(bytes32 fleetId) {
    require(
      FleetStance.getStance(fleetId) == uint8(EFleetStance.None),
      "[Fleet] Can not attack while fleet is in stance"
    );
    _;
  }

  function attack(bytes32 entity, bytes32 targetEntity) public {
    bytes32 redirectedTarget = FleetStance.getTarget(targetEntity);
    if (redirectedTarget != bytes32(0)) {
      targetEntity = redirectedTarget;
    }
    if (IsFleet.get(entity)) {
      if (IsFleet.get(targetEntity)) {
        fleetAttackFleet(entity, targetEntity);
      } else {
        fleetAttackSpaceRock(entity, targetEntity);
      }
    } else {
      spaceRockAttackFleet(entity, targetEntity);
    }
  }

  function fleetAttackFleet(bytes32 fleetId, bytes32 targetFleet)
    private
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetFleet);

    afterBattle(battleId, batteResult);
  }

  function fleetAttackSpaceRock(bytes32 fleetId, bytes32 targetSpaceRock)
    private
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, targetSpaceRock)
    _claimResources(targetSpaceRock)
    _claimUnits(targetSpaceRock)
  {
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetSpaceRock);

    afterBattle(battleId, batteResult);
  }

  function spaceRockAttackFleet(bytes32 spaceRock, bytes32 targetFleet)
    private
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(targetFleet, spaceRock)
    _claimResources(spaceRock)
    _claimUnits(spaceRock)
  {
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(spaceRock, targetFleet);
    afterBattle(battleId, batteResult);
  }

  function afterBattle(bytes32 battleId, NewBattleResultData memory battleResult) internal {
    fleetBattleApplyDamage(battleId, battleResult.aggressorEntity, battleResult.targetDamage);

    if (battleResult.winner == battleResult.aggressorEntity) {
      fleetBattleResolveRaid(battleId, battleResult.aggressorEntity, battleResult.targetEntity);

      if (!IsFleet.get(battleResult.targetEntity)) {
        resolveBattleEncryption(battleId, battleResult);
      }
    }

    fleetBattleApplyDamage(battleId, battleResult.targetEntity, battleResult.aggressorDamage);
  }
}
