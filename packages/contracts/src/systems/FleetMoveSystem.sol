// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

contract FleetMoveSystem is FleetBaseSystem {
  function recallFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetMove.recallFleet(fleetId);
  }

  function sendFleet(
    bytes32 fleetId,
    PositionData memory position
  ) public _onlyFleetOwner(fleetId) _onlyWhenFleetIsInOrbit(fleetId) {
    bytes32 spaceRock = ReversePosition.get(position.x, position.y);
    if (spaceRock == bytes32(0)) {
      spaceRock = LibAsteroid.createSecondaryAsteroid(position);
    }
    LibFleetMove.sendFleet(fleetId, spaceRock);
  }

  function sendFleet(
    bytes32 fleetId,
    bytes32 spaceRock
  ) public _onlyFleetOwner(fleetId) _onlyWhenFleetIsInOrbit(fleetId) {
    require(Asteroid.getIsAsteroid(spaceRock), "[Fleet] Space rock does not exist");
    LibFleetMove.sendFleet(fleetId, spaceRock);
  }
}
