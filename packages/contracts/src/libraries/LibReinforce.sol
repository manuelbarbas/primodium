// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Arrival, EResource, ESendType } from "src/Types.sol";
import { ArrivalCount, UnitLevel, P_RequiredResourcesData, P_UnitPrototypes, P_RequiredResources, P_IsUtility, ResourceCount, OwnedBy, Home } from "codegen/Tables.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibResource } from "libraries/LibResource.sol";

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

library LibReinforce {
  function reinforce(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    require(
      arrival.sendType == ESendType.Reinforce && arrival.arrivalTime < block.timestamp,
      "[Reinforce] Invalid send type"
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      uint256 count = arrival.unitCounts[i];
      LibUnit.addUnitsToAsteroid(playerEntity, rockEntity, unitPrototypes[i], count);
      if (arrival.from != playerEntity) {
        LibUnit.updateStoredUtilities(playerEntity, unitPrototypes[i], count, true);
        LibUnit.updateStoredUtilities(arrival.from, unitPrototypes[i], count, false);
      }
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  function recallReinforcement(
    bytes32 playerEntity,
    bytes32 rockEntity,
    bytes32 arrivalId
  ) internal {
    Arrival memory arrival = ArrivalsMap.get(playerEntity, rockEntity, arrivalId);
    if (
      arrival.sendType != ESendType.Reinforce || arrival.from != playerEntity || arrival.arrivalTime > block.timestamp
    ) {
      return;
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (arrival.unitCounts[i] == 0) continue;
      LibUnit.addUnitsToAsteroid(
        playerEntity,
        Home.getAsteroid(playerEntity),
        unitPrototypes[i],
        arrival.unitCounts[i]
      );
    }
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) - 1);
    ArrivalsMap.remove(playerEntity, rockEntity, arrivalId);
  }

  function recallAllReinforcements(bytes32 playerEntity, bytes32 rockEntity) internal {
    bytes32 owner = OwnedBy.get(rockEntity);
    require(owner != 0, "[Reinforce] Rock not owned");
    bytes32[] memory arrivalKeys = ArrivalsMap.keys(playerEntity, rockEntity);

    for (uint256 i = 0; i < arrivalKeys.length; i++) {
      recallReinforcement(playerEntity, rockEntity, arrivalKeys[i]);
    }
  }
}
