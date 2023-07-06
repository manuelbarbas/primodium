// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibUpgrade } from "../libraries/LibUpgrade.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";

uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    StorageCapacityComponent storageCapacityComponent,
    uint256 playerEntity,
    uint256 startCoordEntity
  ) internal {
    LibNewMine.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      storageCapacityComponent,
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startCoordEntity))
    );
  }

  function checkAndUpdatePlayerStorageAfterUpgrade(
    StorageCapacityComponent storageCapacityComponent,
    uint256 buildingId,
    uint256 newLevel
  ) internal {
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    LibStorage.checkAndUpdatePlayerStorageAfterUpgrade(
      storageCapacityComponent,
      storageCapacityResourcesComponent,
      addressToEntity(msg.sender),
      buildingId,
      newLevel
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));

    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );

    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(tileComponent.has(entity), "[DestroySystem] Cannot destroy tile at an empty coordinate");

    require(buildingComponent.has(entity), "[UpgradeSystem] Cannot upgrade a non-building");
    uint256 ownerKey = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(entity) == ownerKey,
      "[UpgradeSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 blockType = tileComponent.getValue(entity);
    require(
      LibUpgrade.checkUpgradeResearchRequirements(
        buildingComponent,
        requiredResearchComponent,
        researchComponent,
        blockType,
        entity,
        addressToEntity(msg.sender)
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet research requirements"
    );
    require(
      LibUpgrade.checkAndSpendUpgradeResourceRequirements(
        buildingComponent,
        requiredResourcesComponent,
        itemComponent,
        blockType,
        entity,
        addressToEntity(msg.sender)
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet resource requirements"
    );
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    updateUnclaimedForResource(mineComponent, storageCapacityComponent, addressToEntity(msg.sender), entity);

    uint256 newLevel = buildingComponent.getValue(entity) + 1;
    buildingComponent.set(entity, newLevel);

    checkAndUpdatePlayerStorageAfterUpgrade(storageCapacityComponent, blockType, newLevel);
    LibNewMine.checkAndUpdateResourceProductionOnUpgradeMine(
      mineComponent,
      buildingComponent,
      tileComponent,
      addressToEntity(msg.sender),
      entity
    );

    return abi.encode(entity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
