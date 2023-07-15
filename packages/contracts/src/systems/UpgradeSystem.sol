// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingLevelComponent, ID as BuildingComponentID } from "components/BuildingLevelComponent.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
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

contract UpgradeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}




  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );

    
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));

    // Check there isn't another tile there
    uint256 buildingEntity = getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeSystem] no building at this coordinate");
    require(buildingLevelComponent.has(buildingEntity), "[UpgradeSystem] Cannot upgrade a non-building");
    uint256 playerEntity = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(buildingEntity) == playerEntity,
      "[UpgradeSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 buildingType = tileComponent.getValue(buildingEntity);
    require(
      maxLevelComponent.has(buildingType) &&
        (buildingLevelComponent.getValue(buildingEntity) < maxLevelComponent.getValue(buildingType)),
      "[UpgradeSystem] Cannot upgrade building that does not have max level or has reached max level"
    );

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingType, buildingLevelComponent.getValue(buildingEntity) + 1);
    require(
      LibResearch.hasResearched(world, buildingIdLevel, playerEntity),
      "[UpgradeSystem] Cannot upgrade a building that does not meet research requirements"
    );
    require(LibResourceCost.checkAndSpendRequiredResources(
        world,
        buildingIdLevel,
        playerEntity
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet resource requirements"
    );
    uint256 newLevel = buildingLevelComponent.getValue(buildingEntity) + 1;
    buildingLevelComponent.set(buildingEntity, newLevel);

    IOnEntitySubsystem(getAddressById(world.systems(), PostUpgradeSystemID)).executeTyped(msg.sender, buildingEntity);

    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
