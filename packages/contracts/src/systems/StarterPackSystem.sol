// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { StarterPackInitializedComponent, ID as StarterPackInitializedComponentID } from "components/StarterPackInitializedComponent.sol";

import { IronResourceItemID } from "../prototypes/Keys.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

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
      ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
      LibMath.incrementBy(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(msg.sender)), 200);
      starterPackInitializedComponent.set(addressToEntity(msg.sender));
      return abi.encode(true);
    }
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(true));
  }
}
