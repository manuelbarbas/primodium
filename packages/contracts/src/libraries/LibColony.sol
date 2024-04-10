// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { AsteroidOwnedByKey, FleetOwnedByKey } from "src/Keys.sol";

import { MaxColonySlots, P_ColonySlotsConfig, UnitCount, ColonyShipsInTraining } from "codegen/index.sol";
import { AsteroidSet } from "libraries/AsteroidSet.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";

library LibColony {
  function increaseMaxColonySlots(bytes32 playerEntity) internal returns (uint256 newMaxColonySlots) {
    newMaxColonySlots = MaxColonySlots.get(playerEntity) + 1;
    MaxColonySlots.set(playerEntity, newMaxColonySlots);
  }

  function getColonySlotsCostMultiplier(bytes32 playerEntity) internal view returns (uint256) {
    uint256 maxColonySlots = MaxColonySlots.get(playerEntity);
    uint256 multiplier = P_ColonySlotsConfig.getMultiplier();
    return multiplier * maxColonySlots;
  }

  function getColonyShipsPlusAsteroids(bytes32 playerEntity) internal view returns (uint256) {
    bytes32[] memory ownedAsteroids = AsteroidSet.getAsteroidEntities(playerEntity, AsteroidOwnedByKey);

    uint256 ret = 0;
    for (uint256 i = 0; i < ownedAsteroids.length; i++) {
      uint256 shipsEachAsteroid = UnitCount.get(ownedAsteroids[i], ColonyShipPrototypeId);
      ret += shipsEachAsteroid;

      // Fleets are owned by asteroids
      bytes32[] memory ownedFleets = FleetSet.getFleetEntities(ownedAsteroids[i], FleetOwnedByKey);
      for (uint256 j = 0; j < ownedFleets.length; j++) {
        uint256 shipsEachFleet = UnitCount.get(ownedFleets[j], ColonyShipPrototypeId);
        ret += shipsEachFleet;
      }

      // Colony ships being trained on each asteroid
      ret += ColonyShipsInTraining.get(ownedAsteroids[i]);
    }

    return ret + ownedAsteroids.length;
  }
}
