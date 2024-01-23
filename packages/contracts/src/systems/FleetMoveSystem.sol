// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";

contract FleetMoveSystem is FleetBaseSystem {
  function recallFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetMove.recallFleet(_player(), fleetId);
  }

  function sendFleet(bytes32 fleetId, bytes32 spaceRock)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbit(fleetId)
  {
    LibFleetMove.sendFleet(_player(), fleetId, spaceRock);
  }
}
