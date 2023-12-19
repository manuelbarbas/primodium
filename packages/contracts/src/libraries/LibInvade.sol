// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IWorld } from "codegen/world/IWorld.sol";
import { entityToAddress, getSystemResourceId } from "src/utils.sol";
import { OwnedMotherlodes, RockType, OwnedBy, BattleResultData, P_UnitPrototypes } from "codegen/index.sol";
import { ERock, ESendType } from "src/Types.sol";
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
      world.creator(),
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

      bytes32[] memory defenderOwnedMotherlodes = OwnedMotherlodes.get(defender);
      if (defenderOwnedMotherlodes[defenderOwnedMotherlodes.length - 1] != rockEntity) {
        for (uint256 i = 0; i < defenderOwnedMotherlodes.length; i++) {
          if (defenderOwnedMotherlodes[i] == rockEntity) {
            defenderOwnedMotherlodes[i] = defenderOwnedMotherlodes[defenderOwnedMotherlodes.length - 1];
            break;
          }
        }
      }
      OwnedMotherlodes.pop(defender);
      OwnedMotherlodes.push(invader, rockEntity);
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
      world.creator(),
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
    OwnedMotherlodes.push(invader, rockEntity);
  }
}
