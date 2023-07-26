// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { StarterPackClaimedComponent, ID as StarterPackClaimedComponentID } from "components/StarterPackClaimedComponent.sol";

import { IronResourceItemID } from "../prototypes.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.StarterPackSystem"));

contract StarterPackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    StarterPackClaimedComponent starterPackClaimedComponent = StarterPackClaimedComponent(
      getAddressById(components, StarterPackClaimedComponentID)
    );

    // give starter pack of 200 iron to each new player
    if (
      starterPackClaimedComponent.has(addressToEntity(msg.sender)) &&
      starterPackClaimedComponent.getValue(addressToEntity(msg.sender))
    ) {
      return abi.encode(false);
    } else {
      ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
      LibMath.incrementBy(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(msg.sender)), 200);
      starterPackClaimedComponent.set(addressToEntity(msg.sender));
      return abi.encode(true);
    }
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(true));
  }
}
