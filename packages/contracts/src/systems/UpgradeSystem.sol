// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "components/BuildingProductionComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "components/MinesComponent.sol";
import { BuildingKey } from "../prototypes.sol";

import { MainBaseID } from "../prototypes.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as PostUpgradeMineSystemID } from "./PostUpgradeMineSystem.sol";
import { ID as PostUpgradeFactorySystemID } from "./PostUpgradeFactorySystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./SpendRequiredResourcesSystem.sol";
uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    // Check there isn't another tile there
    uint256 buildingEntity = getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeSystem] no building at this coordinate");
    require(levelComponent.has(buildingEntity), "[UpgradeSystem] Cannot upgrade a non-building");
    uint256 playerEntity = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(buildingEntity) == playerEntity,
      "[UpgradeSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 buildingType = buildingTypeComponent.getValue(buildingEntity);
    require(
      maxLevelComponent.has(buildingType) &&
        (levelComponent.getValue(buildingEntity) < maxLevelComponent.getValue(buildingType)),
      "[UpgradeSystem] Cannot upgrade building that does not have max level or has reached max level"
    );

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingType, levelComponent.getValue(buildingEntity) + 1);
    require(
      LibResearch.hasResearched(world, buildingIdLevel, playerEntity),
      "[UpgradeSystem] Cannot upgrade a building that does not meet research requirements"
    );

    if (RequiredResourcesComponent(getAddressById(components, RequiredResourcesComponentID)).has(buildingIdLevel)) {
      require(
        LibResource.hasRequiredResources(world, buildingIdLevel, playerEntity),
        "[UpgradeSystem] You do not have the required resources"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        buildingIdLevel
      );
    }

    uint32 newLevel = levelComponent.getValue(buildingEntity) + 1;
    levelComponent.set(buildingEntity, newLevel);

    if (
      MinesComponent(getAddressById(components, MinesComponentID)).has(LibEncode.hashKeyEntity(buildingType, newLevel))
    ) {
      IOnEntitySubsystem(getAddressById(world.systems(), PostUpgradeFactorySystemID)).executeTyped(
        msg.sender,
        buildingEntity
      );
    } else if (
      BuildingProductionComponent(getAddressById(components, BuildingProductionComponentID)).has(
        LibEncode.hashKeyEntity(buildingType, newLevel)
      )
    ) {
      IOnEntitySubsystem(getAddressById(world.systems(), PostUpgradeMineSystemID)).executeTyped(
        msg.sender,
        buildingEntity
      );
    }
    LibStorage.upgradePlayerStorage(
      world,
      playerEntity,
      buildingTypeComponent.getValue(buildingEntity),
      levelComponent.getValue(buildingEntity)
    );

    LibPassiveResource.updatePassiveProduction(world, playerEntity, buildingType, newLevel);
    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
