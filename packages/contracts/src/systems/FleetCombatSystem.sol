// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { console } from "forge-std/console.sol";

import { ResourceCount, FleetStance, IsFleet, NewBattleResult, NewBattleResultData, FleetMovement, P_GracePeriod, GracePeriod, OwnedBy } from "codegen/index.sol";
import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { EFleetStance, EResource } from "src/Types.sol";
import { fleetBattleResolveRaid, fleetBattleApplyDamage, resolveBattleEncryption, transferSpaceRockOwnership, initializeSpaceRockOwnership } from "libraries/SubsystemCalls.sol";

contract FleetCombatSystem is FleetBaseSystem {
  modifier _onlyWhenSpaceRockNotInGracePeriod(bytes32 spaceRock) {
    require(block.timestamp >= GracePeriod.get(OwnedBy.get(spaceRock)), "[Fleet] Target space rock is in grace period");
    _;
  }

  modifier _onlyWhenFleetNotInGracePeriod(bytes32 fleetId) {
    require(
      !((FleetMovement.getArrivalTime(fleetId) + P_GracePeriod.getFleet()) <= block.timestamp),
      "[Fleet] Target fleet is in grace period"
    );
    _;
  }

  modifier _onlyWhenNotInStance(bytes32 fleetId) {
    require(
      FleetStance.getStance(fleetId) == uint8(EFleetStance.NULL),
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

  function fleetAttackFleet(
    bytes32 fleetId,
    bytes32 targetFleet
  )
    private
    _onlyWhenFleetNotInGracePeriod(targetFleet)
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetFleet);

    afterBattle(battleId, batteResult);
  }

  function fleetAttackSpaceRock(
    bytes32 fleetId,
    bytes32 targetSpaceRock
  )
    private
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenSpaceRockNotInGracePeriod(targetSpaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, targetSpaceRock)
    _claimResources(targetSpaceRock)
    _claimUnits(targetSpaceRock)
  {
    console.log("fleetAttackSpaceRock");
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetSpaceRock);
    console.log("fleetAttackSpaceRock 1");
    afterBattle(battleId, batteResult);
    console.log("fleetAttackSpaceRock 2");
  }

  function spaceRockAttackFleet(
    bytes32 spaceRock,
    bytes32 targetFleet
  )
    private
    _onlyWhenFleetNotInGracePeriod(targetFleet)
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(targetFleet, spaceRock)
    _claimResources(spaceRock)
    _claimUnits(spaceRock)
  {
    (bytes32 battleId, NewBattleResultData memory batteResult) = LibFleetCombat.attack(spaceRock, targetFleet);
    afterBattle(battleId, batteResult);
  }

  function afterBattle(bytes32 battleId, NewBattleResultData memory battleResult) internal {
    console.log("fleetAttackSpaceRock after battle");
    fleetBattleApplyDamage(battleId, battleResult.aggressorEntity, battleResult.targetDamage);
    console.log("fleetAttackSpaceRock after battle deal damage");
    if (battleResult.winner == battleResult.aggressorEntity) {
      console.log("fleetAttackSpaceRock after battle will raid");
      fleetBattleResolveRaid(battleId, battleResult.aggressorEntity, battleResult.targetEntity);
      console.log("fleetAttackSpaceRock after battle raid");
      if (!IsFleet.get(battleResult.targetEntity)) {
        console.log("fleetAttackSpaceRock after battle will encryption");
        resolveBattleEncryption(battleId, battleResult.aggressorEntity, battleResult.targetEntity);
        console.log("fleetAttackSpaceRock after battle encryption");
        if (ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption)) == 0) {
          if (OwnedBy.get(battleResult.targetEntity) != bytes32(0)) {
            console.log("fleetAttackSpaceRock transfer ownership");
            transferSpaceRockOwnership(battleResult.targetEntity, _player());
          } else {
            console.log("fleetAttackSpaceRock initialize ownership");
            initializeSpaceRockOwnership(battleResult.targetEntity, _player());
          }
        }
      }
    }

    fleetBattleApplyDamage(battleId, battleResult.targetEntity, battleResult.aggressorDamage);
  }
}
