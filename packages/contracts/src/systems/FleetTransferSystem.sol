// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetTransfer } from "libraries/fleet/LibFleetTransfer.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { resetFleetIfNoUnitsLeft } from "src/libraries/SubsystemCalls.sol";
contract FleetTransferSystem is FleetBaseSystem {
  function transferUnitsFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  )
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
    _claimUnits(spaceRock)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromSpaceRockToFleet(spaceRock, fleetId, unitCounts);
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  )
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
    _claimResources(spaceRock)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferResourcesFromSpaceRockToFleet(spaceRock, fleetId, resourceCounts);
  }

  function transferUnitsAndResourcesFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
    _claimResources(spaceRock)
    _claimUnits(spaceRock)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromSpaceRockToFleet(spaceRock, fleetId, unitCounts, resourceCounts);
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 fromFleetId,
    bytes32 spaceRock,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fromFleetId, spaceRock)
    _onlyWhenNotPirateAsteroid(spaceRock)
    _claimUnits(spaceRock)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromFleetToSpaceRock(fromFleetId, spaceRock, unitCounts);
    resetFleetIfNoUnitsLeft(fromFleetId);
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 fleetId,
    bytes32 spaceRock,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
    _onlyWhenNotPirateAsteroid(spaceRock)
    _claimResources(spaceRock)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferResourcesFromFleetToSpaceRock(fleetId, spaceRock, resourceCounts);
  }

  function transferUnitsAndResourcesFromFleetToSpaceRock(
    bytes32 fromFleetId,
    bytes32 spaceRock,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fromFleetId, spaceRock)
    _onlyWhenNotPirateAsteroid(spaceRock)
    _claimResources(spaceRock)
    _claimUnits(spaceRock)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToSpaceRock(fromFleetId, spaceRock, unitCounts, resourceCounts);
    resetFleetIfNoUnitsLeft(fromFleetId);
  }

  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fromFleetId, fleetId)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromFleetToFleet(fromFleetId, fleetId, unitCounts);
    resetFleetIfNoUnitsLeft(fromFleetId);
  }

  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fromFleetId, fleetId)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferResourcesFromFleetToFleet(fromFleetId, fleetId, resourceCounts);
  }

  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fromFleetId, fleetId)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToFleet(fromFleetId, fleetId, unitCounts, resourceCounts);
    resetFleetIfNoUnitsLeft(fromFleetId);
  }
}
