// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetMovement, OwnedBy } from "codegen/index.sol";

/**
 * @title FleetMergeSystem
 * @dev Manages the merging of multiple fleets into a single fleet within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetMergeSystem is PrimodiumSystem {
  /**
   * @dev Ensures that all fleets in the array can be merged by the caller.
   * Checks include verifying at least two fleets are provided, all fleets are owned by the same player,
   * and all fleets are in orbit of the same asteroid.
   * @param fleets An array of unique identifiers for the fleets to be merged.
   */
  modifier canMergeFleets(bytes32[] calldata fleets) {
    require(fleets.length > 1, "[Fleet] Must merge at least 2 fleets");
    bytes32 asteroidOwner = OwnedBy.get(fleets[0]);
    require(OwnedBy.get(asteroidOwner) == _player(), "[Fleet] Only fleet owner can call this function");
    require((FleetMovement.getArrivalTime(fleets[0]) <= block.timestamp), "[Fleet] Fleet is not in orbit");
    bytes32 asteroidEntity = FleetMovement.getDestination(fleets[0]);
    for (uint256 i = 0; i < fleets.length; i++) {
      require(OwnedBy.get(fleets[i]) == asteroidOwner, "[Fleet] Only fleet owner can call this function");
      require(
        (FleetMovement.getArrivalTime(fleets[i]) <= block.timestamp) &&
          (FleetMovement.getDestination(fleets[i]) == asteroidEntity),
        "[Fleet] Fleet is not in orbit of asteroid"
      );
    }
    _;
  }

  /**
   * @notice Merges multiple fleets into a single fleet.
   * @dev Calls the `canMergeFleets` modifier to validate the fleets before merging.
   * The fleets must be in orbit of the same asteroid and owned by the same player.
   * @param fleets An array of unique identifiers for the fleets to be merged.
   */
  function mergeFleets(bytes32[] calldata fleets) public canMergeFleets(fleets) {
    LibFleet.mergeFleets(_player(), fleets);
  }
}
