// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { UnitCount, ArrivalCount, OwnedBy, P_UnitPrototypes, Home } from "codegen/index.sol";
import { ESendType } from "src/Types.sol";
import { Arrival } from "src/Types.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibSend } from "libraries/LibSend.sol";

library LibRecall {
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
    if (arrival.arrivalTime >= block.timestamp) {
      arrival.arrivalTime = block.timestamp + block.timestamp - arrival.sendTime;
    } else {
      arrival.arrivalTime = block.timestamp + arrival.arrivalTime - arrival.sendTime;
    }

    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    bytes32 arrivalsMapPlayer = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    ArrivalsMap.remove(arrivalsMapPlayer, rockEntity, arrivalId);

    bytes32 origin = arrival.origin;
    arrival.origin = arrival.destination;
    arrival.destination = origin;
    arrival.sendType = ESendType.Recall;

    LibSend.sendUnits(arrival);
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
