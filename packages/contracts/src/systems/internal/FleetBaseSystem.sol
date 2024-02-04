// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { OwnedBy, FleetMovement, P_UnitPrototypes, P_Transportables } from "src/codegen/index.sol";

contract FleetBaseSystem is PrimodiumSystem {
  modifier _onlyFleetOwner(bytes32 fleetId) {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == _player(), "[Fleet] Only fleet owner can call this function");
    _;
  }

  modifier _onlyWhenFleetIsInOrbit(bytes32 fleetId) {
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet is not in orbit");
    _;
  }

  modifier _onlyWhenFleetIsInOrbitOfSpaceRock(bytes32 fleetId, bytes32 spaceRock) {
    require(
      (FleetMovement.getArrivalTime(fleetId) <= block.timestamp) &&
        (FleetMovement.getDestination(fleetId) == spaceRock),
      "[Fleet] Fleet is not in orbit of space rock"
    );
    _;
  }

  modifier _onlyWhenFleetsAreIsInSameOrbit(bytes32 fleetId, bytes32 fleetId2) {
    require(
      (FleetMovement.getArrivalTime(fleetId) <= block.timestamp) &&
        (FleetMovement.getArrivalTime(fleetId2) <= block.timestamp) &&
        (FleetMovement.getDestination(fleetId) == FleetMovement.getDestination(fleetId2)),
      "[Fleet] Fleets are not in orbit of same space rock"
    );
    _;
  }

  modifier _onlySpaceRockOwner(bytes32 spaceRock) {
    require(OwnedBy.get(spaceRock) == _player(), "[Fleet] Only space rock owner can call this function");
    _;
  }

  modifier _unitCountIsValid(uint256[] memory unitCounts) {
    require(
      unitCounts.length == P_UnitPrototypes.length(),
      "[Fleet] Unit count array must be same length as unit prototypes"
    );
    _;
  }

  modifier _resourceCountIsValid(uint256[] memory resourceCounts) {
    require(
      resourceCounts.length == P_Transportables.length(),
      "[Fleet] Resource count array must be same length as transportable resources"
    );
    _;
  }
  modifier _onlyWhenNotPirateAsteroid(bytes32 spaceRock) {
    require(
      !PirateAsteroid.getIsPirateAsteroid(spaceRock),
      "[Fleet] Action can not be performed towards pirate asteroids"
    );
    _;
  }
}
