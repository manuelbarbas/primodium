// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

// systems
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeRangeSystem, ID as UpgradeRangeSystemID } from "../../systems/UpgradeRangeSystem.sol";

// components
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../../components/LevelComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";

// libraries
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibBuilding } from "../../libraries/LibBuilding.sol";

// types
import "../../types.sol";
import "../../prototypes.sol";

contract UpgradeRangeSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ComponentDevSystem public componentDevSystem;
  BuildSystem public buildSystem;
  UpgradeRangeSystem public upgradeRangeSystem;
  ItemComponent public itemComponent;
  LevelComponent public levelComponent;

  function setUp() public override {
    super.setUp();

    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    upgradeRangeSystem = UpgradeRangeSystem(system(UpgradeRangeSystemID));
    itemComponent = ItemComponent(component(ItemComponentID));
    levelComponent = LevelComponent(component(LevelComponentID));

    spawn(alice);
  }

  function testOutOfBounds() public {
    vm.startPrank(alice);
    uint256 aliceEntity = addressToEntity(alice);
    uint256 asteroid = PositionComponent(world.getComponent(PositionComponentID)).getValue(aliceEntity).parent;

    Bounds memory bounds = LibBuilding.getPlayerBounds(world, aliceEntity);
    vm.expectRevert(bytes("[BuildSystem] Building out of bounds"));
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, Coord(bounds.maxX + 1, bounds.maxY, asteroid));
  }

  function testFailUpgradeRangeResources() public {
    vm.startPrank(alice);
    vm.expectRevert(bytes("[SpendRequiredResourcesSystem] Not enough resources"));
    upgradeRangeSystem.executeTyped();
  }

  function testUpgradeRangeWrongBaseLevel() public {
    uint256 aliceEntity = addressToEntity(alice);
    vm.startPrank(alice);
    componentDevSystem.executeTyped(LevelComponentID, aliceEntity, abi.encode(5));

    require(levelComponent.has(ExpansionResearch6), "should have expansion research 6");
    vm.expectRevert(bytes("[UpgradeRangeSystem] MainBase level requirement not met"));
    upgradeRangeSystem.executeTyped();
  }

  function testUpgrade() public {
    uint256 aliceEntity = addressToEntity(alice);
    vm.startPrank(alice);
    ResourceValues memory resourceValues = P_RequiredResourcesComponent(component(P_RequiredResourcesComponentID))
      .getValue(ExpansionResearch2);
    uint32 level = levelComponent.getValue(aliceEntity);
    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      uint256 resource = resourceValues.resources[i];
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resource, aliceEntity);
      uint32 value = resourceValues.values[i];
      componentDevSystem.executeTyped(ItemComponentID, playerResourceEntity, abi.encode(value));
    }
    upgradeRangeSystem.executeTyped();
    assertEq(levelComponent.getValue(aliceEntity), level + 1);
  }
}
