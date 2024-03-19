// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { S_ClaimSystem } from "systems/subsystems/S_ClaimSystem.sol";

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
