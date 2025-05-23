// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { P_ColonySlotsConfigData, OwnedBy, Asteroid, BuildingType, Home } from "codegen/index.sol";

// libraries
import { LibColony } from "libraries/LibColony.sol";
import { LibResource } from "libraries/LibResource.sol";

// types
import { ShipyardPrototypeId } from "codegen/Prototypes.sol";

contract ColonySystem is PrimodiumSystem {
  /**
   * @dev Pays to increase the MaxColonySlots of a player. If the payment is not made in full, it will be taken as an installment.
   * @param shipyardEntity The identifier of the shipyard building that the payment is executed from.
   * @param paymentAmounts An array of payment amounts for each resource, index based off of P_ColonySlotsConfig.
   * @return fullPayment A boolean indicating whether the payment was completely filled or just an installment.
   * @notice This function requires paymentAmounts.length == P_ColonySlotsConfig.resources.length.
   */
  function payForMaxColonySlots(
    bytes32 shipyardEntity,
    uint256[] calldata paymentAmounts
  )
    public
    _onlyBuildingOwner(shipyardEntity)
    _claimResources(OwnedBy.get(shipyardEntity))
    _claimUnits(OwnedBy.get(shipyardEntity))
    returns (bool)
  {
    require(BuildingType.get(shipyardEntity) == ShipyardPrototypeId, "[Colony] Building is not a Shipyard");

    bytes32 asteroidEntity = OwnedBy.get(shipyardEntity);
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);
    require(playerEntity == _player(), "[Colony] Not owned by player");

    bool fullPayment = LibResource.spendMaxColonySlotsResources(asteroidEntity, paymentAmounts);
    if (fullPayment) {
      LibColony.increaseMaxColonySlots(playerEntity);
    }

    return fullPayment;
  }

  /**
   * @dev Changes the home asteroid for the player.
   * @param asteroidEntity The entity ID of the asteroid to set as the new home.
   * @notice A player can only change their own home asteroid.
   * @notice The asteroid must be owned by the player.
   */
  function changeHome(bytes32 asteroidEntity) public {
    bytes32 playerEntity = _player();
    require(Asteroid.getIsAsteroid(asteroidEntity), "[Colony] Entity is not an asteroid");
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[Colony] Asteroid not owned by player");

    Home.set(playerEntity, asteroidEntity);
  }
}
