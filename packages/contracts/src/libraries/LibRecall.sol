// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";

import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { UnitCount, ArrivalCount, PirateAsteroid, DefeatedPirate, RaidedResource, RockType, OwnedBy, BattleResultData, RaidResult, RaidResultData, P_IsUtility, P_UnitPrototypes, Home } from "codegen/index.sol";
import { ERock, ESendType, EResource, Arrival } from "src/Types.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibMath } from "libraries/LibMath.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { S_BattleSystem } from "systems/subsystems/S_BattleSystem.sol";

library LibRecall {
  /**
   * @dev Recalls units sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   **/
  function recallStationedUnits(bytes32 playerEntity, bytes32 rockEntity) internal {
    require(OwnedBy.get(rockEntity) == playerEntity, "[Recall] Rock not owned by sender");
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    require(homeAsteroid != rockEntity, "[Recall] Can not recall units from home asteroid");
    bool foundUnitToRecall = false;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(playerEntity, rockEntity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      LibUnit.decreaseUnitCount(playerEntity, rockEntity, unitPrototypes[i], unitCount);
      LibUnit.increaseUnitCount(playerEntity, homeAsteroid, unitPrototypes[i], unitCount);
      foundUnitToRecall = true;
    }
    require(foundUnitToRecall, "[Recall] No units to recall");
  }

  /**
   * @dev Recalls units sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to recall.
   */
  function recallArrival(bytes32 playerEntity, bytes32 rockEntity, bytes32 arrivalId) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    require(arrival.from != playerEntity, "[Recall] Arrival not owned by sender");
    require(arrival.arrivalTime > block.timestamp, "[Recall] Arrival not arrived yet");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.increaseUnitCount(playerEntity, Home.getAsteroid(playerEntity), unitPrototypes[i], arrival.unitCounts[i]);
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls units sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrival The arrival to recall.
   */
  function recallArrivalRaw(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId,
    Arrival memory arrival
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.increaseUnitCount(playerEntity, Home.getAsteroid(playerEntity), unitPrototypes[i], arrival.unitCounts[i]);
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls all units sent by a player to a specific rock of the sendType.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param sendType the type of send to recall
   */
  function recallAllArrivalsOfSendType(bytes32 playerEntity, bytes32 rockEntity, ESendType sendType) internal {
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);
    bool foundArrivalToRecall = false;
    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalKeys[i]);
      if (arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) continue;
      if (arrival.sendType != sendType) continue;
      foundArrivalToRecall = true;
      recallArrivalRaw(playerEntity, rockEntity, arrivalKeys[i], arrival);
    }
    require(foundArrivalToRecall, "[Recall] No compatible arrivals to recall");
  }

  /**
   * @dev Recalls all units sent by a player to a specific rock.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   */
  function recallAllArrivals(bytes32 playerEntity, bytes32 rockEntity) internal {
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);

    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalKeys[i]);
      if (arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) continue;
      recallArrivalRaw(playerEntity, rockEntity, arrivalKeys[i], arrival);
    }
  }
}
