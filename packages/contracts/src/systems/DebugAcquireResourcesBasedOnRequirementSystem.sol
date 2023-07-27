// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.DebugAcquireResourcesBasedOnRequirement"));

contract DebugAcquireResourcesBasedOnRequirementSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 entity = abi.decode(args, (uint256));
    if (!LibDebug.isDebug(world)) {
      revert("Not in debug mode");
    }
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceRequirements[i], addressToEntity(msg.sender));
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32(itemComponent, playerResourceEntity) +
          LibMath.getSafeUint32(itemComponent, LibEncode.hashKeyEntity(resourceRequirements[i], entity))
      );
    }

    return abi.encode(0);
  }

  function executeTyped(uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(entity));
  }
}
