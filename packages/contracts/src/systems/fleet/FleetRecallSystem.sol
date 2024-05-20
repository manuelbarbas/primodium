// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";

/**
 * @title FleetRecallSystem
 * @dev Manages the recall operations for fleets within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetRecallSystem is PrimodiumSystem {
  /**
   * @notice Recalls a fleet back to its origin.
   * @dev Can only be called by the fleet owner and ensures the fleet is not in any stance.
   * @param fleetEntity The unique identifier for the fleet to be recalled.
   */
  function recallFleet(bytes32 fleetEntity) public _onlyFleetOwner(fleetEntity) _onlyNotInStance(fleetEntity) {
    LibFleetMove.recallFleet(fleetEntity);
  }
}
