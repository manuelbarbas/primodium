// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetTransfer } from "libraries/fleet/LibFleetTransfer.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

contract FleetTransferSystem is PrimodiumSystem {
  function transferUnitsFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromAsteroidToFleet(asteroidEntity, fleetId, unitCounts);
  }

  function transferResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, asteroidEntity)
    _claimResources(asteroidEntity)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferResourcesFromAsteroidToFleet(asteroidEntity, fleetId, resourceCounts);
  }

  function transferUnitsAndResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyAsteroidOwner(asteroidEntity)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromAsteroidToFleet(asteroidEntity, fleetId, unitCounts, resourceCounts);
  }

  function transferUnitsFromFleetToAsteroid(
    bytes32 fromFleetId,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenNotInCooldown(fromFleetId)
    _onlyWhenFleetIsInOrbitOfAsteroid(fromFleetId, asteroidEntity)
    _onlyWhenNotPirateAsteroid(asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromFleetToAsteroid(fromFleetId, asteroidEntity, unitCounts);
  }

  function transferResourcesFromFleetToAsteroid(
    bytes32 fleetId,
    bytes32 asteroidEntity,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInCooldown(fleetId)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, asteroidEntity)
    _onlyWhenNotPirateAsteroid(asteroidEntity)
    _claimResources(asteroidEntity)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferResourcesFromFleetToAsteroid(fleetId, asteroidEntity, resourceCounts);
  }

  function transferUnitsAndResourcesFromFleetToAsteroid(
    bytes32 fromFleetId,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenFleetIsInOrbitOfAsteroid(fromFleetId, asteroidEntity)
    _onlyWhenNotInCooldown(fromFleetId)
    _onlyWhenNotPirateAsteroid(asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToAsteroid(
      fromFleetId,
      asteroidEntity,
      unitCounts,
      resourceCounts
    );
  }

  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenNotInCooldown(fromFleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fromFleetId, fleetId)
    _unitCountIsValid(unitCounts)
  {
    LibFleetTransfer.transferUnitsFromFleetToFleet(fromFleetId, fleetId, unitCounts);
  }

  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  )
    public
    _onlyFleetOwner(fromFleetId)
    _onlyWhenNotInCooldown(fromFleetId)
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
    _onlyWhenNotInCooldown(fromFleetId)
    _onlyWhenFleetsAreIsInSameOrbit(fromFleetId, fleetId)
    _unitCountIsValid(unitCounts)
    _resourceCountIsValid(resourceCounts)
  {
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToFleet(fromFleetId, fleetId, unitCounts, resourceCounts);
  }
}
