// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Messages } from "../codegen/index.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

interface WorldWithIncrement {
  function increment() external returns (uint32);

  function callFrom(
    address delegator,
    ResourceId systemId,
    bytes memory callData
  ) external payable returns (bytes memory);
}

contract MessageSystem is System {
  function incrementMessage(string memory message) public returns (uint32) {
    // call the base world's function
    uint32 newVal = WorldWithIncrement(_world()).increment();

    // store the message in the extended world's table
    Messages.set(newVal, message);

    // do you want to do anything else?

    return newVal;
  }

  function incrementMessageFrom(address delegator, string memory message) public returns (uint32) {
    ResourceId counterSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, ROOT_NAMESPACE, "IncrementSystem");
    // call the base world's function
    bytes memory callFromReturn = WorldWithIncrement(_world()).callFrom(
      delegator,
      counterSystemId,
      abi.encodeWithSignature("increment()")
    );

    uint32 newVal = abi.decode(callFromReturn, (uint32));
    // store the message in the extended world's table
    Messages.set(newVal, message);

    // do you want to do anything else?

    return newVal;
  }
}
