// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract FleetDisbandSystem is PrimodiumSystem {
  function disbandFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetDisband.disbandFleet(fleetId);
    IWorld world = IWorld(_world());
    world.Primodium__resetFleetIfNoUnitsLeft(fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbit(fleetId)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetDisband.disbandUnitsAndResourcesFromFleet(fleetId, unitCounts, resourceCounts);
    IWorld world = IWorld(_world());
    world.Primodium__resetFleetIfNoUnitsLeft(fleetId);
  }

  function disbandUnits(
    bytes32 fleetId,
    uint256[] calldata unitCounts
  ) public _onlyWhenFleetIsInOrbit(fleetId) _onlyFleetOwner(fleetId) _unitCountIsValid(unitCounts) {
    LibFleetDisband.disbandUnits(fleetId, unitCounts);
    IWorld world = IWorld(_world());
    world.Primodium__resetFleetIfNoUnitsLeft(fleetId);
  }

  function disbandResources(
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  ) public _onlyFleetOwner(fleetId) _resourceCountIsValid(resourceCounts) {
    LibFleetDisband.disbandResources(fleetId, resourceCounts);
  }
}
