// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { PirateAsteroid, DefeatedPirate, RaidedResource, RockType, OwnedBy, BattleResultData, RaidResult, RaidResultData, P_IsUtility, P_UnitPrototypes, Home } from "codegen/index.sol";
import { ERock, ESendType, EResource } from "src/Types.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibMath } from "libraries/LibMath.sol";

import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";

library LibRaid {
  /**
   * @dev Initiates a raid on an asteroid rock entity.
   * @param playerEntity The identifier of the player initiating the raid.
   * @param rockEntity The identifier of the target asteroid rock.
   */
  function raid(bytes32 playerEntity, bytes32 rockEntity) internal {
    require(RockType.get(rockEntity) == uint8(ERock.Asteroid), "[LibRaid] Can only raid asteroids");

    bytes32 defenderEntity = OwnedBy.get(rockEntity);
    require(defenderEntity != 0, "[LibRaid] Can not raid unowned rock");
    require(defenderEntity != playerEntity, "[LibRaid] Can not raid your own rock");

    bytes memory rawBr = SystemCall.callWithHooksOrRevert(
      entityToAddress(playerEntity),
      getSystemResourceId("S_BattleSystem"),
      abi.encodeCall(S_BattleSystem.battle, (playerEntity, defenderEntity, rockEntity, ESendType.Raid)),
      0
    );
    BattleResultData memory br = abi.decode(rawBr, (BattleResultData));

    resolveRaid(br);
  }

  function checkRaidRequirements(bytes32 raider, bytes32 rockEntity) internal view {
    require(RockType.get(rockEntity) == uint8(ERock.Asteroid), "[LibRaid] Can only raid asteroids");
    bytes32 defenderEntity = OwnedBy.get(rockEntity);
    require(defenderEntity != 0, "[LibRaid] Can not raid unowned rock");
    require(defenderEntity != raider, "[LibRaid] Can not raid your own rock");
  }

  /**
   * @dev Resolves the outcome of a raid battle and calculates resources raided.
   * @param br The battle result data.
   * @return raidResult The raid result data including resources before raid and raided amounts.
   */
  function resolveRaid(BattleResultData memory br) internal returns (RaidResultData memory) {
    LibBattle.updateUnitsAfterBattle(br, ESendType.Raid);
    (uint256 totalResources, uint256[] memory defenderResources) = LibResource.getAllResourceCounts(br.defender);
    RaidResultData memory raidResult = RaidResultData({
      defenderValuesBeforeRaid: new uint256[](defenderResources.length),
      raidedAmount: new uint256[](defenderResources.length)
    });
    if (br.winner != br.attacker) return raidResult;
    if (PirateAsteroid.get(br.rock).playerEntity == br.attacker)
      DefeatedPirate.set(br.attacker, PirateAsteroid.get(br.rock).prototype, true);
    if (br.totalCargo == 0 || totalResources == 0) return raidResult;

    for (uint8 i = 1; i < defenderResources.length; i++) {
      uint8 resource = i;
      if (P_IsUtility.get(resource)) continue;

      uint256 raidAmount = LibMath.min(defenderResources[i], (br.totalCargo * defenderResources[i]) / totalResources);
      if (raidAmount == 0) continue;
      RaidedResource.set(br.attacker, resource, RaidedResource.get(br.attacker, resource) + raidAmount);
      raidResult.defenderValuesBeforeRaid[i] = defenderResources[i];
      raidResult.raidedAmount[i] = raidAmount;
      LibStorage.increaseStoredResource(br.attacker, resource, raidAmount);
      LibStorage.decreaseStoredResource(br.defender, resource, raidAmount);
    }
    RaidResult.set(keccak256(abi.encode(br)), raidResult);
    return raidResult;
  }
}
