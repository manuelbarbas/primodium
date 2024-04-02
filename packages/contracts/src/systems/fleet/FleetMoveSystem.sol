// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { OwnedBy, Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

/**
 * @title FleetMoveSystem
 * @dev Manages fleet movement operations within the Primodium game, extending PrimodiumSystem functionalities.
 */
contract FleetMoveSystem is PrimodiumSystem {
  /**
   * @dev Ensures the fleet is not sent to the asteroid it is already orbiting.
   * @param fleetEntity The unique identifier for the fleet.
   * @param asteroidEntity The unique identifier for the target asteroid.
   */
  modifier _onlyDifferentAsteroid(bytes32 fleetEntity, bytes32 asteroidEntity) {
    require(
      FleetMovement.getDestination(fleetEntity) != asteroidEntity,
      "[Fleet] Cannot send fleet to the asteroid which the fleet is orbiting"
    );
    _;
  }

  /**
   * @dev Ensures the target asteroid exists.
   * @param asteroidEntity The unique identifier for the target asteroid.
   */
  modifier _onlyIfAsteroidExists(bytes32 asteroidEntity) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[Fleet] Asteroid does not exist");
    _;
  }

  /**
   * @notice Sends a fleet to a specified position, potentially creating a secondary asteroid if none exists there.
   * @param fleetEntity The unique identifier for the fleet being sent.
   * @param position The position to which the fleet is sent.
   */
  function sendFleet(bytes32 fleetEntity, PositionData memory position) public {
    bytes32 asteroidEntity = ReversePosition.get(position.x, position.y);
    if (asteroidEntity == bytes32(0)) {
      asteroidEntity = IWorld(_world()).Primodium__createSecondaryAsteroid(position);
    }
    sendFleet(fleetEntity, asteroidEntity);
  }

  /**
   * @notice Sends a fleet to a specified asteroid, enforcing various preconditions for the move.
   * @param fleetEntity The unique identifier for the fleet being sent.
   * @param asteroidEntity The unique identifier for the target asteroid.
   */
  function sendFleet(
    bytes32 fleetEntity,
    bytes32 asteroidEntity
  )
    public
    _onlyIfAsteroidExists(asteroidEntity)
    _onlyFleetOwner(fleetEntity)
    _onlyWhenFleetIsInOrbit(fleetEntity)
    _onlyWhenNotInStance(fleetEntity)
    _onlyDifferentAsteroid(fleetEntity, asteroidEntity)
  {
    LibFleetMove.sendFleet(fleetEntity, asteroidEntity);
  }
}
