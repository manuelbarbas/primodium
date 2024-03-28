// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { FleetStance, FleetMovement } from "src/codegen/index.sol";
import { EFleetStance } from "src/codegen/common.sol";

/**
 * @title FleetStanceSystem
 * @dev Manages the stances that fleets can take within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetStanceSystem is PrimodiumSystem {
  /**
   * @notice Clears the current stance of a fleet, returning it to a neutral state.
   * @dev Can only be called by the fleet owner and when the fleet is in orbit. Removes any stance the fleet is currently taking.
   * @param fleetEntity The unique identifier for the fleet whose stance is to be cleared.
   */
  function clearFleetStance(
    bytes32 fleetEntity
  ) public _onlyFleetOwner(fleetEntity) _onlyWhenFleetIsInOrbit(fleetEntity) {
    LibFleetStance.clearFleetStance(fleetEntity);
  }

  /**
   * @notice Sets the stance for a fleet, defining its behavior towards other fleets or asteroids.
   * @dev Can only be called by the fleet owner and when the fleet is in orbit. Validates that the target is not taking a stance and, for certain stances, ensures the fleet is orbiting the target asteroid.
   * @param fleetEntity The unique identifier for the fleet whose stance is being set.
   * @param stance The stance to set for the fleet, represented as an integer corresponding to the `EFleetStance` enum.
   * @param target The target entity (either a fleet or an asteroid) relevant to the stance being set.
   */
  function setFleetStance(
    bytes32 fleetEntity,
    uint8 stance,
    bytes32 target
  ) public _onlyFleetOwner(fleetEntity) _onlyWhenFleetIsInOrbit(fleetEntity) {
    require(
      FleetStance.getStance(target) == uint8(EFleetStance.NULL),
      "[Fleet] Cannot target a fleet that is taking a stance"
    );
    if (stance == uint8(EFleetStance.Defend) || stance == uint8(EFleetStance.Block)) {
      require(FleetMovement.getDestination(fleetEntity) == target, "[Fleet] Fleet must be in orbit of target asteroid");
    }
    LibFleetStance.setFleetStance(fleetEntity, stance, target);
  }
}
