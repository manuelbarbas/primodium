// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { UnitCount, ArrivalCount, OwnedBy, P_UnitPrototypes, Home } from "codegen/index.sol";
import { ESendType } from "src/Types.sol";
import { Arrival } from "src/Types.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";

library LibRecall {
  /**
   * @dev Recalls units sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   **/
  function recallStationedUnits(bytes32 playerEntity, bytes32 rockEntity) internal {
    require(OwnedBy.get(rockEntity) == playerEntity, "[Recall] Rock not owned by player");
    bytes32 homeAsteroid = Home.get(playerEntity);
    require(homeAsteroid != rockEntity, "[Recall] Can not recall units from home asteroid");
    bool foundUnitToRecall = false;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(rockEntity, unitPrototypes[i]);
      if (unitCount == 0) continue;
      LibUnit.decreaseUnitCount(rockEntity, unitPrototypes[i], unitCount);
      LibUnit.increaseUnitCount(homeAsteroid, unitPrototypes[i], unitCount);
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
  function recallArrival(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival;
    bytes32 owner = OwnedBy.get(rockEntity);
    if (ArrivalsMap.has(playerEntity, rockEntity, arrivalId)) {
      arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    } else if (owner > 0 && ArrivalsMap.has(owner, rockEntity, arrivalId)) {
      arrival = ArrivalsMap.get(owner, rockEntity, arrivalId);
    } else {
      revert("[Recall] invalid arrival");
    }
    require(arrival.from == playerEntity, "[Recall] Arrival not sent by player");
    recallArrivalRaw(rockEntity, arrivalId, arrival);
  }

  /**
   * @dev Recalls units sent by a player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival ro recall.
   * @param arrival The arrival to recall.
   */
  function recallArrivalRaw(
    bytes32 rockEntity,
    bytes32 arrivalId,
    Arrival memory arrival
  ) internal {
    bytes32 playerEntity = arrival.from;
    require(arrival.arrivalTime < block.timestamp, "[Recall] Arrival not arrived yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.increaseUnitCount(Home.get(playerEntity), unitPrototypes[i], arrival.unitCounts[i]);
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    bytes32 arrivalsMapPlayer = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    ArrivalsMap.remove(arrivalsMapPlayer, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls all units sent by a player to a specific rock of the sendType.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param sendType the type of send to recall
   */
  function recallAllArrivalsOfSendType(
    bytes32 playerEntity,
    bytes32 rockEntity,
    ESendType sendType
  ) internal {
    bytes32 arrivalsMapPlayer = sendType == ESendType.Reinforce ? OwnedBy.get(rockEntity) : playerEntity;
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(arrivalsMapPlayer, rockEntity);
    bool foundArrivalToRecall = false;
    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      Arrival memory arrival = ArrivalsMap.get(arrivalsMapPlayer, rockEntity, arrivalKeys[i]);
      if (arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) continue;
      if (arrival.sendType != sendType) continue;
      foundArrivalToRecall = true;
      recallArrivalRaw(rockEntity, arrivalKeys[i], arrival);
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
      recallArrivalRaw(rockEntity, arrivalKeys[i], arrival);
    }
    bytes32 owner = OwnedBy.get(rockEntity);
    if (owner > 0 && owner != playerEntity) {
      arrivalKeys = ArrivalsMap.keys(owner, rockEntity);
      for (uint256 i = 0; i < arrivalKeys.length; i++) {
        Arrival memory arrival = ArrivalsMap.get(owner, rockEntity, arrivalKeys[i]);
        if (arrival.from != playerEntity || arrival.arrivalTime > block.timestamp) continue;
        recallArrivalRaw(rockEntity, arrivalKeys[i], arrival);
      }
    }
  }
}
