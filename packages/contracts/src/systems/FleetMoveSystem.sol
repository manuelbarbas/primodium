// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { OwnedBy, PirateAsteroid, Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

contract FleetMoveSystem is FleetBaseSystem {
  modifier _onlyOtherAsteroid(bytes32 fleetId, bytes32 asteroidEntity) {
    require(
      FleetMovement.getDestination(fleetId) != asteroidEntity,
      "[Fleet] Can not send fleet to the asteroid which the fleet is already in orbit of"
    );
    _;
  }

  modifier _onlyWhenPersonalPirate(bytes32 asteroidEntity) {
    bytes32 pirateAsteroidPersonalPlayer = PirateAsteroid.getPlayerEntity(asteroidEntity);
    require(
      pirateAsteroidPersonalPlayer == bytes32(0) || pirateAsteroidPersonalPlayer == _player(),
      "[Fleet] Can only send fleet to your own pirate asteroid"
    );
    _;
  }

  modifier _onlyIfAsteroidExists(bytes32 asteroidEntity) {
    require(Asteroid.getIsAsteroid(asteroidEntity), "[Fleet] asteroid does not exist");
    _;
  }

  modifier _canNotSendFleetFromPirateAsteroidToAsteroidOtherThanOrigin(bytes32 fleetId, bytes32 asteroidEntity) {
    require(
      !PirateAsteroid.getIsPirateAsteroid(FleetMovement.getDestination(fleetId)) ||
        OwnedBy.get(fleetId) == asteroidEntity,
      "[Fleet] Can not send fleet from pirate asteroid to asteroid other than origin"
    );
    _;
  }

  function sendFleet(bytes32 fleetId, PositionData memory position) public {
    bytes32 asteroidEntity = ReversePosition.get(position.x, position.y);
    if (asteroidEntity == bytes32(0)) {
      asteroidEntity = IWorld(_world()).Primodium__createSecondaryAsteroid(position);
    }
    sendFleet(fleetId, asteroidEntity);
  }

  function sendFleet(
    bytes32 fleetId,
    bytes32 asteroidEntity
  )
    public
    _onlyIfAsteroidExists(asteroidEntity)
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbit(fleetId)
    _onlyWhenNotInStance(fleetId)
    _onlyOtherAsteroid(fleetId, asteroidEntity)
    _onlyWhenNotPirateAsteroidOrHasNotBeenDefeated(asteroidEntity)
    _onlyWhenPersonalPirate(asteroidEntity)
    _canNotSendFleetFromPirateAsteroidToAsteroidOtherThanOrigin(fleetId, asteroidEntity)
  {
    LibFleetMove.sendFleet(fleetId, asteroidEntity);
  }
}
