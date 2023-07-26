pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID } from "../prototypes/Keys.sol";

uint256 constant ID = uint256(keccak256("system.DebugAcquireStorageForAllResources"));

uint32 constant BIGNUM = 1_294_967_295;

contract DebugAcquireStorageForAllResourcesSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256[11] memory allResourceIds = [
      BolutiteResourceItemID,
      CopperResourceItemID,
      IridiumResourceItemID,
      IronResourceItemID,
      KimberliteResourceItemID,
      LithiumResourceItemID,
      OsmiumResourceItemID,
      TitaniumResourceItemID,
      TungstenResourceItemID,
      UraniniteResourceItemID,
      IronPlateCraftedItemID
    ];

    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );

    uint256[] memory storageCapacity = new uint256[](allResourceIds.length);

    for (uint256 i = 0; i < allResourceIds.length; i++) {
      storageCapacityComponent.set(LibEncode.hashKeyEntity(allResourceIds[i], addressToEntity(msg.sender)), BIGNUM);
      storageCapacity[i] = allResourceIds[i];
    }
    storageCapacityResourcesComponent.set(addressToEntity(msg.sender), storageCapacity);
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(0));
  }
}
