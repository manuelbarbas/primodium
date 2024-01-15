// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { _player as player } from "src/utils.sol";

import { getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { DUMMY_ADDRESS } from "src/constants.sol";
import { S_SharedHooksSystem } from "systems/subsystems/S_SharedHooksSystem.sol";

contract PrimodiumSystem is System {
  modifier claimResources(bytes32 spaceRockEntity) {
    _claimResources(spaceRockEntity);
    _;
  }

  modifier claimUnits(bytes32 spaceRockEntity) {
    _claimUnits(spaceRockEntity);
    _;
  }

  function _claimResources(bytes32 spaceRockEntity) internal {
    SystemCall.callWithHooksOrRevert(
      DUMMY_ADDRESS,
      getSystemResourceId("S_SharedHooksSystem"),
      abi.encodeCall(S_SharedHooksSystem.claimResources, (spaceRockEntity)),
      0
    );
  }

  function _claimUnits(bytes32 spaceRockEntity) internal {
    SystemCall.callWithHooksOrRevert(
      DUMMY_ADDRESS,
      getSystemResourceId("S_SharedHooksSystem"),
      abi.encodeCall(S_SharedHooksSystem.claimUnits, (spaceRockEntity)),
      0
    );
  }

  function addressToEntity(address a) internal pure returns (bytes32) {
    return bytes32(uint256(uint160((a))));
  }

  function entityToAddress(bytes32 a) internal pure returns (address) {
    return address(uint160(uint256((a))));
  }

  function _player() internal view returns (bytes32) {
    return player(_msgSender());
  }
}
