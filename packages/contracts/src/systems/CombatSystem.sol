// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IWorld } from "codegen/world/IWorld.sol";
import { PirateAsteroid, UnitCount, ResourceCount, FleetStance, IsFleet, BattleResult, BattleResultData, FleetMovement, GracePeriod, OwnedBy } from "codegen/index.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { EFleetStance, EResource } from "src/Types.sol";
import { CapitalShipPrototypeId } from "codegen/Prototypes.sol";

contract CombatSystem is PrimodiumSystem {
  modifier _onlyWhenNotInGracePeriod(bytes32 entity) {
    require(block.timestamp >= GracePeriod.get(entity), "[Fleet] Target is in grace period");
    _;
  }

  function attack(bytes32 entity, bytes32 targetEntity) public {
    if (IsFleet.get(entity)) {
      if (IsFleet.get(targetEntity)) {
        fleetAttackFleet(entity, targetEntity);
      } else {
        fleetAttackAsteroid(entity, targetEntity);
      }
    } else {
      asteroidAttackFleet(entity, targetEntity);
    }
  }

  function fleetAttackFleet(
    bytes32 fleetId,
    bytes32 targetFleet
  )
    private
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInCooldown(fleetId)
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fleetId, targetFleet)
  {
    (bytes32 battleId, BattleResultData memory batteResult) = LibCombat.attack(fleetId, targetFleet);

    afterBattle(battleId, batteResult);
  }

  function fleetAttackAsteroid(
    bytes32 fleetId,
    bytes32 targetAsteroid
  )
    private
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInCooldown(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyWhenNotInGracePeriod(targetAsteroid)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, targetAsteroid)
    _onlyWhenNotPirateAsteroidOrHasNotBeenDefeated(targetAsteroid)
    _claimResources(targetAsteroid)
    _claimUnits(targetAsteroid)
  {
    (bytes32 battleId, BattleResultData memory batteResult) = LibCombat.attack(fleetId, targetAsteroid);
    afterBattle(battleId, batteResult);
  }

  function asteroidAttackFleet(
    bytes32 asteroidEntity,
    bytes32 targetFleet
  )
    private
    _onlyWhenNotInGracePeriod(targetFleet)
    _onlyAsteroidOwner(asteroidEntity)
    _onlyWhenFleetIsInOrbitOfAsteroid(targetFleet, asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
  {
    (bytes32 battleId, BattleResultData memory battleResult) = LibCombat.attack(asteroidEntity, targetFleet);
    afterBattle(battleId, battleResult);
  }

  function afterBattle(bytes32 battleId, BattleResultData memory battleResult) internal {
    bool isAggressorWinner = battleResult.winner == battleResult.aggressorEntity;

    bool isAggressorFleet = IsFleet.get(battleResult.aggressorEntity);

    bool isTargetFleet = IsFleet.get(battleResult.targetEntity);
    bytes32 defendingPlayerEntity = isTargetFleet
      ? OwnedBy.get(OwnedBy.get(battleResult.targetEntity))
      : OwnedBy.get(battleResult.targetEntity);
    bool isPirateAsteroid = PirateAsteroid.getIsPirateAsteroid(battleResult.targetEntity);

    bool decrypt = isAggressorFleet && UnitCount.get(battleResult.aggressorEntity, CapitalShipPrototypeId) > 0;
    bool isRaid = isAggressorWinner && (isTargetFleet || !decrypt || isPirateAsteroid);
    bool isDecryption = !isRaid && isAggressorWinner && !isTargetFleet && decrypt && !isPirateAsteroid;

    IWorld world = IWorld(_world());
    if (battleResult.targetDamage > 0)
      world.Primodium__applyDamage(
        battleId,
        defendingPlayerEntity,
        battleResult.aggressorEntity,
        battleResult.targetDamage
      );

    if (isRaid) {
      world.Primodium__battleRaidResolve(battleId, battleResult.aggressorEntity, battleResult.targetEntity);
    }
    if (isDecryption) {
      //in decryption we resolve encryption first so the fleet decryption unit isn't lost before decrypting
      LibCombat.resolveBattleEncryption(battleId, battleResult.targetEntity, battleResult.aggressorEntity);
      if (ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption)) == 0) {
        if (OwnedBy.get(battleResult.targetEntity) != bytes32(0)) {
          world.Primodium__transferAsteroid(battleResult.targetEntity, _player());
        } else {
          world.Primodium__initAsteroidOwner(battleResult.targetEntity, _player());
        }
      }
    }
    world.Primodium__applyDamage(battleId, _player(), battleResult.targetEntity, battleResult.aggressorDamage);
    if (isPirateAsteroid && isAggressorWinner) {
      world.Primodium__resolvePirateAsteroid(_player(), battleResult.targetEntity);
    }
  }
}
