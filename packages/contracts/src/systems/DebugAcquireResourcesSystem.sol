// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.DebugAcquireResources"));

contract DebugAcquireResourcesSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 resourceId, uint32 amount) = abi.decode(args, (uint256, uint32));
    if (!LibDebug.isDebug(world)) {
      revert("Not in debug mode");
    }
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    uint256 playerEntity = addressToEntity(msg.sender);
    itemComponent.set(
      LibEncode.hashKeyEntity(resourceId, playerEntity),
      LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(resourceId, playerEntity)) + amount
    );
    return abi.encode(LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(resourceId, playerEntity)));
  }

  function executeTyped(uint256 resourceId, uint256 amount) public returns (bytes memory) {
    return execute(abi.encode(resourceId, amount));
  }
}
