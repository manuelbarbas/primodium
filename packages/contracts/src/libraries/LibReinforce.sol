// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Arrival, ESendType } from "src/Types.sol";
import { ArrivalCount, P_RequiredResourcesData, P_UnitPrototypes, P_RequiredResources, P_IsUtility, ResourceCount, OwnedBy, Home } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibResource } from "libraries/LibResource.sol";

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

library LibReinforce {
  /**
   * @dev Reinforces a player's rock with units from an arrival.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to use for reinforcement.
   */
  function reinforce(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    require(playerEntity == arrival.to, "[Reinforce] Player does not control these units");
    require(
      arrival.sendType == ESendType.Reinforce && arrival.arrivalTime < block.timestamp,
      "[Reinforce] Invalid send type"
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      uint256 count = arrival.unitCounts[i];
      LibUnit.increaseUnitCount(rockEntity, unitPrototypes[i], count);
      //todo in future updates this condition will be removed and Home.getAsteroid will be the space rocks in the arrival
      if (arrival.from != playerEntity) {
        LibUnit.updateStoredUtilities(Home.getAsteroid(arrival.to), unitPrototypes[i], count, true);
        LibUnit.updateStoredUtilities(Home.getAsteroid(arrival.from), unitPrototypes[i], count, false);
      }
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls a reinforcement sent by a player.
   * @param playerEntity The identifier of the player.
   * @param rockEntity The identifier of the target rock.
   * @param arrivalId The identifier of the arrival to recall.
   */
  function recallReinforcement(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    if (arrival.sendType != ESendType.Reinforce) {
      return;
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.increaseUnitCount(Home.getAsteroid(arrival.from), unitPrototypes[i], arrival.unitCounts[i]);
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  /**
   * @dev Recalls all reinforcements sent to a specific rock owned by some player.
   * @param rockEntity The identifier of the target rock.
   */
  function recallAllReinforcements(bytes32 rockEntity) internal {
    bytes32 playerEntity = OwnedBy.get(rockEntity);
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);
    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      recallReinforcement(playerEntity, rockEntity, arrivalKeys[i]);
    }
  }
}
