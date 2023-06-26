pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.DebugAquireResources"));

contract DebugAquireResourcesSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 resourceId, uint256 amount) = abi.decode(args, (uint256, uint256));
    if (!LibDebug.isDebug()) {
      revert("Not in debug mode");
    }
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    itemComponent.set(
      LibEncode.hashKeyEntity(resourceId, addressToEntity(msg.sender)),
      LibMath.getSafeUint256Value(itemComponent, LibEncode.hashKeyEntity(resourceId, addressToEntity(msg.sender))) +
        amount
    );
    return
      abi.encode(
        LibMath.getSafeUint256Value(itemComponent, LibEncode.hashKeyEntity(resourceId, addressToEntity(msg.sender)))
      );
  }

  function executeTyped(uint256 resourceId, uint256 amount) public returns (bytes memory) {
    return execute(abi.encode(resourceId, amount));
  }
}
