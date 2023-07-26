pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";

import { MainBaseID } from "../prototypes.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID } from "../prototypes.sol";

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

    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));
    OwnedResourcesComponent ownedResourcesComponent = OwnedResourcesComponent(
      getAddressById(components, OwnedResourcesComponentID)
    );

    uint256[] memory maxStorage = new uint256[](allResourceIds.length);

    for (uint256 i = 0; i < allResourceIds.length; i++) {
      maxStorageComponent.set(LibEncode.hashKeyEntity(allResourceIds[i], addressToEntity(msg.sender)), BIGNUM);
      maxStorage[i] = allResourceIds[i];
    }
    ownedResourcesComponent.set(addressToEntity(msg.sender), maxStorage);
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(0));
  }
}
