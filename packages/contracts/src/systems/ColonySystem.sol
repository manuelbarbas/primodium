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
  /**
   * @dev Pays for the colony slots capacity of a player. If the payment is not made in full, it will be taken as an installment.
   * @param asteroidEntity The identifier of the asteroid entity that the payment will come from.
   * @param paymentAmounts An array of payment amounts for each resource, index based off of P_ColonySlotsConfig.
   * @return fullPayment A boolean indicating whether the payment was completely filled or just an installment.
   * @notice This function requires paymentAmounts.length == P_ColonySlotsConfig.resources.length.
   */
  function payForColonySlotsCapacity(
    bytes32 asteroidEntity,
    uint256[] calldata paymentAmounts
  ) external returns (bool) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[Colony] Paying entity is not an asteroid");
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);

    bool fullPayment = LibResource.spendColonySlotsCapacityResources(asteroidEntity, paymentAmounts);
    if (fullPayment) {
      LibColony.increaseColonySlotsCapacity(playerEntity);
    }

    return fullPayment;
  }
}
