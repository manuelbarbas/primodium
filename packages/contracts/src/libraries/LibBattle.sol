// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "codegen/world/IWorld.sol";
import { ESendType, Arrival } from "src/Types.sol";
import { UnitCount, UnitLevel, BattleResult, BattleResultData, P_UnitPrototypes, P_Unit, ArrivalCount, UnitCount } from "codegen/Tables.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";

library LibBattle {
  function battle(
    bytes32 attackerEntity,
    bytes32 defenderEntity,
    bytes32 rockEntity,
    ESendType sendType
  ) internal returns (BattleResultData memory battleResult) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    battleResult.attackerUnitsLeft = new uint256[](unitPrototypes.length);
    battleResult.defenderUnitsLeft = new uint256[](unitPrototypes.length);

    (uint256 attackCount, uint256 attackPoints) = getAttackPoints(attackerEntity, rockEntity, sendType);
    (uint256 defenseCount, uint256 defensePoints) = getDefensePoints(defenderEntity, rockEntity);
    bool isAttackerWinner = attackPoints > defensePoints;

    battleResult.winner = isAttackerWinner ? attackerEntity : defenderEntity;

    uint256 lossRatio;
    if (isAttackerWinner) {
      lossRatio = 100 - (attackPoints == 0 ? 0 : ((defensePoints * 100) / attackPoints));
      for (uint256 i = 0; i < unitPrototypes.length; i++) {
        battleResult.attackerUnitsLeft[i] = (attackCount * lossRatio) / 100;
      }
    } else {
      lossRatio = 100 - (defensePoints == 0 ? 0 : ((attackPoints * 100) / defensePoints));
      for (uint256 i = 0; i < unitPrototypes.length; i++) {
        battleResult.defenderUnitsLeft[i] = (defenseCount * lossRatio) / 100;
      }
    }

    BattleResult.emitEphemeral(keccak256(abi.encode(battleResult)), battleResult);

    return battleResult;
  }

  function getDefensePoints(bytes32 defenderEntity, bytes32 rockEntity)
    internal
    view
    returns (uint256 defenseCount, uint256 defensePoints)
  {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 defenderUnitCount = UnitCount.get(defenderEntity, rockEntity, unitPrototypes[i]);
      uint256 defenderLevel = UnitLevel.get(defenderEntity, unitPrototypes[i]);
      defensePoints += defenderUnitCount * P_Unit.get(unitPrototypes[i], defenderLevel).defense;
      defenseCount += defenderUnitCount;
    }
  }

  function getAttackPoints(
    bytes32 attackerEntity,
    bytes32 rockEntity,
    ESendType sendType
  ) internal returns (uint256 attackUnits, uint256 attackPoints) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(attackerEntity, rockEntity);
    uint256 arrivalsApplied = 0;
    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      Arrival memory arrival = ArrivalsMap.get(attackerEntity, rockEntity, arrivalKeys[i]);

      if (arrival.sendType != sendType || arrival.arrivalTime > block.timestamp) continue;

      for (uint256 j = 0; j < unitPrototypes.length; j++) {
        if (arrival.unitCounts[j] == 0) continue;
        uint256 unitLevel = UnitLevel.get(attackerEntity, unitPrototypes[j]);
        attackPoints += arrival.unitCounts[j] * P_Unit.get(unitPrototypes[j], unitLevel).attack;
        attackUnits += arrival.unitCounts[j];
      }

      ArrivalsMap.remove(attackerEntity, rockEntity, arrivalKeys[i]);
      arrivalsApplied++;
    }
    ArrivalCount.set(attackerEntity, arrivalKeys.length - arrivalsApplied);
  }
}
