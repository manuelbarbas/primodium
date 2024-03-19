// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { S_ClaimSystem } from "systems/subsystems/S_ClaimSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { EFleetStance } from "src/Types.sol";
import { CooldownEnd, FleetStance, OwnedBy, FleetMovement, P_UnitPrototypes, P_Transportables, PirateAsteroid } from "src/codegen/index.sol";

contract PrimodiumSystem is System {
  modifier onlyAdmin() {
    address namespaceOwner = NamespaceOwner.get(WorldResourceIdLib.encodeNamespace(bytes14("Primodium")));
    require(namespaceOwner == _msgSender(), "[Primodium] Only admin");
    _;
  }

  modifier _claimResources(bytes32 asteroidEntity) {
    IWorld(_world()).Primodium__claimResources(asteroidEntity);
    _;
  }

  modifier _claimUnits(bytes32 asteroidEntity) {
    IWorld(_world()).Primodium__claimUnits(asteroidEntity);
    _;
  }

  modifier _onlyFleetOwner(bytes32 fleetId) {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == _player(), "[Fleet] Not fleet owner");
    _;
  }

  modifier _onlyWhenFleetIsInOrbit(bytes32 fleetId) {
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet is not in orbit");
    _;
  }

  modifier _onlyWhenNotInCooldown(bytes32 fleetId) {
    require(block.timestamp >= CooldownEnd.get(fleetId), "[Fleet] Fleet is in cooldown");
    _;
  }

  modifier _onlyWhenFleetIsInOrbitOfAsteroid(bytes32 fleetId, bytes32 asteroidEntity) {
    require(
      (FleetMovement.getArrivalTime(fleetId) <= block.timestamp) &&
        (FleetMovement.getDestination(fleetId) == asteroidEntity),
      "[Fleet] Fleet is not in orbit"
    );
    _;
  }

  modifier _onlyWhenFleetsAreIsInSameOrbit(bytes32 fleetId, bytes32 fleetId2) {
    require(
      (FleetMovement.getArrivalTime(fleetId) <= block.timestamp) &&
        (FleetMovement.getArrivalTime(fleetId2) <= block.timestamp) &&
        (FleetMovement.getDestination(fleetId) == FleetMovement.getDestination(fleetId2)),
      "[Fleet] Fleets are not in orbit"
    );
    _;
  }

  modifier _onlyAsteroidOwner(bytes32 asteroidEntity) {
    require(OwnedBy.get(asteroidEntity) == _player(), "[Fleet] Not asteroid owner");
    _;
  }

  modifier _unitCountIsValid(uint256[] memory unitCounts) {
    require(unitCounts.length == P_UnitPrototypes.length(), "[Fleet] Incorrect unit array length");
    _;
  }

  modifier _resourceCountIsValid(uint256[] memory resourceCounts) {
    require(resourceCounts.length == P_Transportables.length(), "[Fleet] Incorrect resource array length");
    _;
  }
  modifier _onlyWhenNotPirateAsteroid(bytes32 asteroidEntity) {
    require(!PirateAsteroid.getIsPirateAsteroid(asteroidEntity), "[Fleet] Target cannot be pirate asteroid");
    _;
  }

  modifier _onlyWhenNotPirateAsteroidOrHasNotBeenDefeated(bytes32 asteroidEntity) {
    require(!PirateAsteroid.getIsDefeated(asteroidEntity), "[Fleet] Target pirate asteroid has been defeated");
    require(
      !PirateAsteroid.getIsPirateAsteroid(asteroidEntity) ||
        PirateAsteroid.getPlayerEntity(asteroidEntity) == _player(),
      "[Fleet] Can only attack personal pirate asteroid"
    );
    _;
  }

  modifier _onlyWhenNotInStance(bytes32 fleetId) {
    require(FleetStance.getStance(fleetId) == uint8(EFleetStance.NULL), "[Fleet] Fleet cannot be in stance");
    _;
  }
  function addressToEntity(address a) internal pure returns (bytes32) {
    return bytes32(uint256(uint160((a))));
  }

  function entityToAddress(bytes32 a) internal pure returns (address) {
    return address(uint160(uint256((a))));
  }

  function _player() internal view returns (bytes32) {
    return addressToEntity(_msgSender());
  }
}
