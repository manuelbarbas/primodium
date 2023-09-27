// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "codegen/world/IWorld.sol";
import { RockType, OwnedBy, BattleResultData, P_UnitPrototypes } from "codegen/Tables.sol";
import { ERock, ESendType } from "src/Types.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { MotherlodeSet } from "libraries/MotherlodeSet.sol";
import { LibUnit } from "libraries/LibUnit.sol";

library LibInvade {
  /**
   * @dev Initiates an invasion of a rock entity, specifically a motherlode.
   * @param world The world contract.
   * @param invader The identifier of the invader.
   * @param rockEntity The identifier of the target rock.
   */
  function invade(
    IWorld world,
    bytes32 invader,
    bytes32 rockEntity
  ) internal {
    require(RockType.get(rockEntity) == ERock.Motherlode, "[Invade] Can only invade motherlodes");

    bytes32 defender = OwnedBy.get(rockEntity);
    if (defender == 0) return invadeNeutral(invader, rockEntity);

    require(defender != invader, "[Invade]: can not invade your own rock");

    BattleResultData memory br = world.battle(invader, defender, rockEntity, ESendType.Invade);

    LibBattle.updateUnitsAfterBattle(br, ESendType.Invade);
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
    (uint256[] memory attackCounts, , ) = LibBattle.getAttackPoints(invader, rockEntity, ESendType.Invade);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      LibUnit.addUnitsToAsteroid(invader, rockEntity, unitTypes[i], attackCounts[i]);
    }
  }
}
