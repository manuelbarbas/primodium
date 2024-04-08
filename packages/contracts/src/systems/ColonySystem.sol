// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { P_ColonySlotsConfigData, OwnedBy, Asteroid } from "codegen/index.sol";

// libraries
import { LibColony } from "libraries/LibColony.sol";
import { LibResource } from "libraries/LibResource.sol";

// types

contract ColonySystem is PrimodiumSystem {
  function payForColonySlotsCapacity(
    bytes32 asteroidEntity,
    P_ColonySlotsConfigData calldata payment
  ) external returns (bool) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[Colony] Paying entity is not an asteroid");
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);

    bool fullPayment = LibResource.spendColonySlotsCapacityResources(asteroidEntity, payment);
    if (fullPayment) {
      LibColony.increaseColonySlotsCapacity(playerEntity);
    }

    return fullPayment;
  }
}
