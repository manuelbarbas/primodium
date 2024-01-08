// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorld } from "codegen/world/IWorld.sol";
import { entityToAddress, getSystemResourceId } from "src/utils.sol";
import { OwnedBy, BattleResultData, P_UnitPrototypes, Asteroid } from "codegen/index.sol";
import { ESendType } from "src/Types.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";

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
      DUMMY_ADDRESS,
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.battle, (invader, defender, rockEntity, ESendType.Invade)),
      0
    );
    BattleResultData memory br = abi.decode(rawBr, (BattleResultData));
    SystemCall.callWithHooksOrRevert(
      DUMMY_ADDRESS,
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.updateUnitsAfterBattle, (br, ESendType.Invade)),
      0
    );
    if (invader == br.winner) {
      LibReinforce.recallAllReinforcements(rockEntity);
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
    require(Asteroid.getIsAsteroid(rockEntity), "[Invade] Can only invade asteroids");
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
      DUMMY_ADDRESS,
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
}
