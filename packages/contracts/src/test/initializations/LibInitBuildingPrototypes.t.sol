// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "../../components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, PassiveResourceProductionData } from "components/PassiveResourceProductionComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID, RequiredPassiveResourceData } from "components/RequiredPassiveResourceComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import "libraries/LibInitBuildingPrototypes.sol";

import "../../types.sol";
import "../../prototypes.sol";
// in-game blocks/factories

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibInitBuildingPrototypesTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
  }

  function testBuildingsHaveCorrectRequirements() public {
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(world.components(), MaxLevelComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(world.components(), RequiredResourcesComponentID)
    );

    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    IUint256Component components = world.components();

    RequiredTileComponent requiredTileComponent = RequiredTileComponent(
      getAddressById(components, RequiredTileComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    vm.startPrank(alice);

    BuildingPrototype memory prototype = LibInitBuildingPrototypes.ironMinePrototype();
    assertEq(requiredTileComponent.getValue(IronMineID), prototype.requiredTile, "required tile");

    assertEq(maxLevelComponent.getValue(IronMineID), prototype.maxLevel, "max level");

    for (uint j = 0; j < prototype.maxLevel; j++) {
      uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, j + 1);
      assertEq(mineComponent.getValue(buildingIdLevel), prototype.productionRates[j]);
      assertEq(requiredResearch.getValue(buildingIdLevel), prototype.requiredResearch[j], "research");
      uint256[] memory resources = requiredResources.getValue(buildingIdLevel);
      for (uint i = 0; i < resources.length; i++) {
        assertEq(resources[i], prototype.requiredResources[j][i].resource, "2 resource");
        assertEq(
          itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], buildingIdLevel)),
          prototype.requiredResources[j][i].cost,
          "item"
        );
      }
    }
  }
}
