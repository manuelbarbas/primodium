// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { RockType, OwnedBy, BattleResultData, P_UnitPrototypes } from "codegen/index.sol";
import { ERock, ESendType } from "src/Types.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { MotherlodeSet } from "libraries/MotherlodeSet.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";

library LibInvade {
  /**
   * @dev Initiates an invasion of a rock entity, specifically a motherlode.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   */
  function invade(bytes32 invader, bytes32 rockEntity) internal {
    require(RockType.get(rockEntity) == ERock.Motherlode, "[Invade] Can only invade motherlodes");

    bytes32 defender = OwnedBy.get(rockEntity);
    if (defender == 0) return invadeNeutral(invader, rockEntity);

    require(defender != invader, "[Invade] can not invade your own rock");

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
      MotherlodeSet.add(invader, rockEntity);
      MotherlodeSet.remove(defender, rockEntity);
      OwnedBy.set(rockEntity, invader);
    } else {
      LibReinforce.recallAllReinforcements(invader, rockEntity);
    }
  }

  /**
   * @dev Handles the invasion of a neutral rock entity by an invader.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   */
  function invadeNeutral(bytes32 invader, bytes32 rockEntity) internal {
    MotherlodeSet.add(invader, rockEntity);
    OwnedBy.set(rockEntity, invader);
    bytes32[] memory unitTypes = P_UnitPrototypes.get();
    bytes memory rawAttackCounts = SystemCall.callWithHooksOrRevert(
      entityToAddress(invader),
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.getAttackPoints, (invader, rockEntity, ESendType.Invade)),
      0
    );
    (uint256[] memory attackCounts, , ) = abi.decode(rawAttackCounts, (uint256[], uint256, uint256));
    for (uint256 i = 0; i < unitTypes.length; i++) {
      LibUnit.increaseUnitCount(invader, rockEntity, unitTypes[i], attackCounts[i]);
    }
  }
}
