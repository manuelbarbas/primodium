// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { PirateAsteroid, Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

/**
 * @title FleetRecallSystem
 * @dev Manages the recall operations for fleets within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetRecallSystem is PrimodiumSystem {
  /**
   * @dev Ensures the fleet's origin is not a pirate asteroid before recalling.
   * @param fleetEntity The unique identifier for the fleet to be recalled.
   */
  modifier _onlyWhenOriginIsNotPirateAsteroid(bytes32 fleetEntity) {
    require(
      !PirateAsteroid.getIsPirateAsteroid(FleetMovement.getOrigin(fleetEntity)),
      "[Fleet] Cannot recall fleet sent from pirate asteroid"
    );
    _;
  }

  /**
   * @notice Recalls a fleet back to its origin.
   * @dev Can only be called by the fleet owner and when the fleet's origin is not a pirate asteroid. Also ensures the fleet is not in any stance.
   * @param fleetEntity The unique identifier for the fleet to be recalled.
   */
  function recallFleet(
    bytes32 fleetEntity
  )
    public
    _onlyFleetOwner(fleetEntity)
    _onlyWhenOriginIsNotPirateAsteroid(fleetEntity)
    _onlyWhenNotInStance(fleetEntity)
  {
    LibFleetMove.recallFleet(fleetEntity);
  }
}
