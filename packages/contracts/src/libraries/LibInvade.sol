// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorld } from "codegen/world/IWorld.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { Home, ArrivalCount, RockType, OwnedBy, BattleResultData, P_UnitPrototypes } from "codegen/index.sol";
import { ERock, ESendType, Arrival } from "src/Types.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

library LibInvade {
  /**
   * @dev Initiates an invasion of a rock entity, specifically a motherlode.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   */
  function invade(
    IWorld world,
    bytes32 invader,
    bytes32 rockEntity
  ) internal {
    bytes32 defender = OwnedBy.get(rockEntity);
    if (defender == 0) return invadeNeutral(world, invader, rockEntity);

    bytes memory rawBr = SystemCall.callWithHooksOrRevert(
      entityToAddress(invader),
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.battle, (invader, defender, rockEntity, ESendType.Invade)),
      0
    );
    BattleResultData memory br = abi.decode(rawBr, (BattleResultData));
    SystemCall.callWithHooksOrRevert(
      entityToAddress(invader),
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.updateUnitsAfterBattle, (br, ESendType.Invade)),
      0
    );
    if (invader == br.winner) {
      LibReinforce.recallAllReinforcements(defender, rockEntity);
      OwnedBy.set(rockEntity, invader);
    }
  }

  /**
   * @dev Checks the requirements for initiating an invasion.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   * @notice Ensures that the target rock is a motherlode and not owned by the invader.
   */
  function checkInvadeRequirements(bytes32 invader, bytes32 rockEntity) internal {
    require(RockType.get(rockEntity) == uint8(ERock.Motherlode), "[Invade] Can only invade motherlodes");
    bytes32 defender = OwnedBy.get(rockEntity);
    if (defender != 0) require(defender != invader, "[Invade] can not invade your own rock");
  }

  /**
   * @dev Handles the invasion of a neutral rock entity by an invader.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   */
  function invadeNeutral(
    IWorld world,
    bytes32 invader,
    bytes32 rockEntity
  ) internal {
    bytes32[] memory unitTypes = P_UnitPrototypes.get();

    bytes memory rawAttackCounts = SystemCall.callWithHooksOrRevert(
      entityToAddress(invader),
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.getAttackPoints, (invader, rockEntity, ESendType.Invade)),
      0
    );

    (uint256[] memory attackCounts, uint256 attackPoints, ) = abi.decode(
      rawAttackCounts,
      (uint256[], uint256, uint256)
    );
    for (uint256 i = 0; i < unitTypes.length; i++) {
      LibUnit.increaseUnitCount(invader, rockEntity, unitTypes[i], attackCounts[i]);
    }
    require(attackPoints > 0, "[Invade] Can not invade with 0 attack points");
    OwnedBy.set(rockEntity, invader);
  }

  /**
   * @dev Recalls a reinforcement sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to recall.
   */
  function recallInvade(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    if (arrival.sendType != ESendType.Invade || arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) {
      return;
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.increaseUnitCount(playerEntity, Home.getAsteroid(playerEntity), unitPrototypes[i], arrival.unitCounts[i]);
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls all reinforcements sent by a player to a specific rock.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   */
  function recallAllInvades(bytes32 playerEntity, bytes32 rockEntity) internal {
    bytes32 owner = OwnedBy.get(rockEntity);
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);

    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      recallInvade(playerEntity, rockEntity, arrivalKeys[i]);
    }
  }
}
