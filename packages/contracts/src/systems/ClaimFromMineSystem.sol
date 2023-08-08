// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "systems/UpdateUnclaimedResourcesSystem.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
uint256 constant ID = uint256(keccak256("system.ClaimFromMine"));

contract ClaimFromMineSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    // Components
    uint256 playerEntity = addressToEntity(msg.sender);

    Coord memory coord = abi.decode(args, (Coord));

    // check if main base
    uint256 entity = getBuildingFromCoord(coord);
    require(
      BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).has(entity),
      "[ClaimFromMineSystem] Cannot claim from mines on an empty coordinate"
    );

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entity);
    require(
      ownedEntityAtStartCoord == playerEntity,
      "[ClaimFromMineSystem] Cannot claim from mines on a tile you do not own"
    );

    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );
    if (!maxResourceStorageComponent.has(playerEntity)) return abi.encode(false);
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    uint256[] memory storageResourceIds = maxResourceStorageComponent.getValue(playerEntity);
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (ProductionComponent(world.getComponent(ProductionComponentID)).has(playerResourceEntity)) {
        IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
          msg.sender,
          storageResourceIds[i]
        );
      }
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
    }

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
