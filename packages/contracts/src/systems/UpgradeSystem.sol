// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } f
import { BuildingKey } from "../prototypes/Keys.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as PostUpgradeSystemID } from "./PostUpgradeSystem.sol";

uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkAndSpendUpgradeResourceRequirements(
    BuildingComponent buildingComponent,
    RequiredResourcesComponent resourceRequirementsComponent,
    ItemComponent itemComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal returns (bool) {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 currentLevel = buildingComponent.getValue(buildingEntity);
    require(currentLevel > 0, "[LibUpgrade] can not upgrade building that is level 0");
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, currentLevel + 1);
    return
      LibResourceCost.checkAndSpendRequiredResources(
        resourceRequirementsComponent,
        itemComponent,
        buildingIdLevel,
        playerEntity
      );
  }

  function checkUpgradeResearchRequirements(
    BuildingComponent buildingComponent,
    RequiredResearchComponent researchRequirmentComponent,
    ResearchComponent researchComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal view returns (bool) {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(buildingEntity) + 1);
    return
      !researchRequirmentComponent.has(buildingIdLevel) ||
      LibResearch.checkResearchRequirements(
        researchRequirmentComponent,
        researchComponent,
        buildingIdLevel,
        playerEntity
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
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(tileComponent.has(entity), "[UpgradeSystem] Cannot upgrade tile at an empty coordinate");
    require(buildingComponent.has(entity), "[UpgradeSystem] Cannot upgrade a non-building");
    uint256 ownerKey = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(entity) == ownerKey,
      "[UpgradeSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 blockType = tileComponent.getValue(entity);
    require(
      maxLevelComponent.has(blockType) && (buildingComponent.getValue(entity) < maxLevelComponent.getValue(blockType)),
      "[UpgradeSystem] Cannot upgrade building that does not have max level or has reached max level"
    );
    require(
      checkUpgradeResearchRequirements(
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
      checkAndSpendUpgradeResourceRequirements(
        buildingComponent,
        requiredResourcesComponent,
        itemComponent,
        blockType,
        entity,
        addressToEntity(msg.sender)
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet resource requirements"
    );
    uint256 newLevel = buildingComponent.getValue(entity) + 1;
    buildingComponent.set(entity, newLevel);

    IOnEntitySubsystem(getAddressById(world.systems(), PostUpgradeSystemID)).executeTyped(msg.sender, entity);

    return abi.encode(entity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
