// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";

import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { ArrivalCount, PirateAsteroid, DefeatedPirate, RaidedResource, RockType, OwnedBy, BattleResultData, RaidResult, RaidResultData, P_IsUtility, P_UnitPrototypes, Home } from "codegen/index.sol";
import { ERock, ESendType, EResource, Arrival } from "src/Types.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibMath } from "libraries/LibMath.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";

library LibRaid {
  /**
   * @dev Initiates a raid on an asteroid rock entity.
   * @param playerEntity The identifier of the player initiating the raid.
   * @param rockEntity The identifier of the target asteroid rock.
   */
  function raid(
    IWorld world,
    bytes32 playerEntity,
    bytes32 rockEntity
  ) internal {
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
    (uint256 totalResources, uint256[] memory defenderResources) = LibResource.getAllResourceCountsVaulted(br.defender);
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

  /**
   * @dev Recalls target raid sent by a player to a specific rock.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to recall.
   */
  function recallRaid(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    if (arrival.sendType != ESendType.Raid || arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) {
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
   * @dev Recalls all raids sent by a player to a specific rock.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   */
  function recallAllRaids(bytes32 playerEntity, bytes32 rockEntity) internal {
    bytes32 owner = OwnedBy.get(rockEntity);
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);

    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      recallRaid(playerEntity, rockEntity, arrivalKeys[i]);
    }
  }
}
