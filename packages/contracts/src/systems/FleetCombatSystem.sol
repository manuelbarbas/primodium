// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PirateAsteroid, ResourceCount, FleetStance, IsFleet, BattleResult, BattleResultData, FleetMovement, P_GracePeriod, GracePeriod, OwnedBy } from "codegen/index.sol";
import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { EFleetStance, EResource } from "src/Types.sol";
import { fleetBattleResolveRaid, fleetBattleApplyDamage, fleetResolveBattleEncryption, transferSpaceRockOwnership, initializeSpaceRockOwnership, fleetResolvePirateAsteroid } from "libraries/SubsystemCalls.sol";

contract FleetCombatSystem is FleetBaseSystem {
  modifier _onlyWhenSpaceRockNotInGracePeriod(bytes32 spaceRock) {
    require(block.timestamp >= GracePeriod.get(spaceRock), "[Fleet] Target space rock is in grace period");
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
    (bytes32 battleId, BattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetFleet);

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
    _onlyWhenNotPirateAsteroidOrHasNotBeenDefeated(targetSpaceRock)
    _claimResources(targetSpaceRock)
    _claimUnits(targetSpaceRock)
  {
    (bytes32 battleId, BattleResultData memory batteResult) = LibFleetCombat.attack(fleetId, targetSpaceRock);
    afterBattle(battleId, batteResult);
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
    (bytes32 battleId, BattleResultData memory batteResult) = LibFleetCombat.attack(spaceRock, targetFleet);
    afterBattle(battleId, batteResult);
  }

  function afterBattle(bytes32 battleId, BattleResultData memory battleResult) internal {
    bool isAggressorWinner = battleResult.winner == battleResult.aggressorEntity;

    bool isAggressorFleet = IsFleet.get(battleResult.aggressorEntity);

    bool isTargetFleet = IsFleet.get(battleResult.targetEntity);
    bytes32 defendingPlayerEntity = isTargetFleet
      ? OwnedBy.get(OwnedBy.get(battleResult.targetEntity))
      : OwnedBy.get(battleResult.targetEntity);
    uint256 aggressorDecryption = 0;
    bytes32 aggressorDecryptionUnitPrototype = bytes32(0);
    if (isAggressorFleet)
      (aggressorDecryptionUnitPrototype, aggressorDecryption) = LibFleetAttributes.getDecryption(
        battleResult.aggressorEntity
      );
    bool isPirateAsteroid = PirateAsteroid.getIsPirateAsteroid(battleResult.targetEntity);
    bool isRaid = isAggressorWinner && (isTargetFleet || aggressorDecryption == 0 || isPirateAsteroid);

    bool isDecryption = !isRaid && isAggressorWinner && !isTargetFleet && aggressorDecryption > 0 && !isPirateAsteroid;
    fleetBattleApplyDamage(battleId, defendingPlayerEntity, battleResult.aggressorEntity, battleResult.targetDamage);

    if (isRaid) {
      fleetBattleResolveRaid(battleId, battleResult.aggressorEntity, battleResult.targetEntity);
    } else if (isDecryption) {
      //in decryption we resolve encryption first so the fleet decryption unit isn't lost before decrypting
      LibFleetCombat.resolveBattleEncryption(
        battleId,
        battleResult.targetEntity,
        battleResult.aggressorEntity,
        aggressorDecryptionUnitPrototype,
        aggressorDecryption
      );
      if (ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption)) == 0) {
        if (OwnedBy.get(battleResult.targetEntity) != bytes32(0)) {
          transferSpaceRockOwnership(battleResult.targetEntity, _player());
        } else {
          initializeSpaceRockOwnership(battleResult.targetEntity, _player());
        }
      }
    }
    fleetBattleApplyDamage(battleId, _player(), battleResult.targetEntity, battleResult.aggressorDamage);
    if (isPirateAsteroid && isAggressorWinner) {
      fleetResolvePirateAsteroid(_player(), battleResult.targetEntity);
    }
  }
}
