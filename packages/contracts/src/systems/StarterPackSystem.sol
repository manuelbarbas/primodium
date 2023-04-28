// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { StarterPackInitializedComponent, ID as StarterPackInitializedComponentID } from "components/StarterPackInitializedComponent.sol";

import { LibMath } from "libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.StarterPackSystem"));

contract StarterPackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    StarterPackInitializedComponent starterPackInitializedComponent = StarterPackInitializedComponent(
      getAddressById(components, StarterPackInitializedComponentID)
    );

    // give starter pack of 200 iron to each new player
    if (
      starterPackInitializedComponent.has(addressToEntity(msg.sender)) &&
      starterPackInitializedComponent.getValue(addressToEntity(msg.sender))
    ) {
      return abi.encode(false);
    } else {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      LibMath.incrementBy(ironResourceComponent, addressToEntity(msg.sender), 200);
      starterPackInitializedComponent.set(addressToEntity(msg.sender));
      return abi.encode(true);
    }
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(true));
  }
}
