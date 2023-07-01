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
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID } from "components/FactoryProductionComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibUpgrade } from "../libraries/LibUpgrade.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    StorageCapacityComponent storageCapacityComponent,
    uint256 playerEntity,
    uint256 resourceId
  ) internal {
    LibNewMine.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      storageCapacityComponent,
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      resourceId
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

  function handleFactoryUpgrade(
    MineComponent mineComponent,
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
    uint256 factoryEntity
  ) internal {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashFromKey(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );
    if (factoryIsFunctionalComponent.has(factoryEntity)) {
      updateUnclaimedForResource(
        mineComponent,
        StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
        addressToEntity(msg.sender),
        factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
      );
    }
    LibFactory.checkAndUpdateResourceProductionOnUpgradeFactory(
      FactoryProductionComponent(getAddressById(components, FactoryProductionComponentID)),
      factoryIsFunctionalComponent,
      mineComponent,
      tileComponent,
      buildingComponent,
      PathComponent(getAddressById(components, PathComponentID)),
      addressToEntity(msg.sender),
      factoryEntity
    );
  }

  function handleMineUpgrade(
    MineComponent mineComponent,
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 mineEntity
  ) internal {
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    if (pathComponent.has(mineEntity)) {
      if (tileComponent.getValue(pathComponent.getValue(mineEntity)) == MainBaseID) {
        updateUnclaimedForResource(
          mineComponent,
          StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
          addressToEntity(msg.sender),
          LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity))
        );
        LibNewMine.checkAndUpdateResourceProductionOnUpgradeMine(
          mineComponent,
          buildingComponent,
          tileComponent,
          addressToEntity(msg.sender),
          mineEntity
        );
      } else {
        uint256 factoryEntity = pathComponent.getValue(mineEntity);
        FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
          getAddressById(components, FactoryMineBuildingsComponentID)
        );
        FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
          getAddressById(components, FactoryIsFunctionalComponentID)
        );
        FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
          getAddressById(components, FactoryProductionComponentID)
        );
        bool isFunctional = factoryIsFunctionalComponent.has(factoryEntity);
        if (isFunctional) {
          uint256 buildingLevelEntity = LibEncode.hashFromKey(
            tileComponent.getValue(factoryEntity),
            buildingComponent.getValue(factoryEntity)
          );
          updateUnclaimedForResource(
            mineComponent,
            StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
            addressToEntity(msg.sender),
            factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
          );
        }
        LibFactory.onMineConnectedToFactoryUpgrade(
          factoryIsFunctionalComponent,
          factoryMineBuildingsComponent,
          pathComponent,
          buildingComponent,
          factoryEntity
        );
        if (!isFunctional && factoryIsFunctionalComponent.has(factoryEntity)) {
          LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
            factoryProductionComponent,
            mineComponent,
            tileComponent,
            buildingComponent,
            addressToEntity(msg.sender),
            factoryEntity,
            true
          );
        }
      }
    }
  }

  function handleUpgradeAndPostUpgradeCallbacks(
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 entity,
    uint256 buildingId
  ) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    updateUnclaimedForResource(mineComponent, storageCapacityComponent, addressToEntity(msg.sender), entity);

    uint256 newLevel = buildingComponent.getValue(entity) + 1;
    buildingComponent.set(entity, newLevel);

    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    uint256 buildingIdLevelEntity = LibEncode.hashFromKey(buildingId, newLevel);
    if (mineComponent.has(buildingIdLevelEntity)) {
      handleMineUpgrade(mineComponent, buildingComponent, tileComponent, entity);
    } else if (factoryMineBuildingsComponent.has(buildingIdLevelEntity)) {
      handleFactoryUpgrade(mineComponent, tileComponent, buildingComponent, entity);
    }
    checkAndUpdatePlayerStorageAfterUpgrade(storageCapacityComponent, buildingId, newLevel);
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
    handleUpgradeAndPostUpgradeCallbacks(buildingComponent, tileComponent, entity, blockType);
    return abi.encode(entity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
