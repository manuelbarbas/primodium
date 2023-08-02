// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { ResearchSystem, ID as ResearchSystemID } from "../../systems/ResearchSystem.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "../../components/HasResearchedComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { IronResourceItemID, CopperResourceItemID, LithiumResourceItemID, IronPlateCraftedItemID } from "../../prototypes.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { Coord } from "../../types.sol";

import "../../prototypes.sol";

contract ResearchSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  ComponentDevSystem public componentDevSystem;
  ItemComponent public itemComponent;

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    itemComponent = ItemComponent(component(ItemComponentID));

    vm.stopPrank();
  }

  function testFailResearchInvalidID() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    // arbitrary ID
    researchSystem.executeTyped(5);
    vm.stopPrank();
  }

  function testResearchWithResourceRequirements() public {
    vm.startPrank(alice);

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(component(HasResearchedComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    uint256[] memory resourceRequirements = RequiredResourcesComponent(world.getComponent(RequiredResourcesComponentID))
      .getValue(DebugSimpleTechnologyResourceReqsID);

    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceEntity = LibEncode.hashKeyEntity(resourceRequirements[i], DebugSimpleTechnologyResourceReqsID);
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceRequirements[i], addressToEntity(alice));
      uint256 playerResources = LibMath.getSafe(itemComponent, playerResourceEntity);
      uint256 resources = LibMath.getSafe(itemComponent, resourceEntity);
      componentDevSystem.executeTyped(ItemComponentID, playerResourceEntity, abi.encode(playerResources + resources));
    }
    // alice researches DebugSimpleTechnologyResourceReqsID
    researchSystem.executeTyped(DebugSimpleTechnologyResourceReqsID);
    assertTrue(
      hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResourceReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyResourceReqsID"
    );
    // not enough resources
    vm.stopPrank();
  }

  function testFailResearchWithResourceRequirements() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    // alice researches DebugSimpleTechnologyResourceReqsID
    researchSystem.executeTyped(DebugSimpleTechnologyResourceReqsID);
    // not enough resources
    vm.stopPrank();
  }

  function testResearchWithResearchRequirements() public {
    vm.startPrank(alice);

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(component(HasResearchedComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyNoReqsID yet"
    );
    assertTrue(
      !hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyResearchReqsID yet"
    );
    researchSystem.executeTyped(DebugSimpleTechnologyNoReqsID);
    assertTrue(
      hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyNoReqsID"
    );

    researchSystem.executeTyped(DebugSimpleTechnologyResearchReqsID);
    assertTrue(
      hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyResearchReqsID"
    );
    // not enough resources
    vm.stopPrank();
  }

  function testFailResearchWithResearchRequirementsNotMet() public {
    vm.startPrank(alice);

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(component(HasResearchedComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyNoReqsID yet"
    );
    assertTrue(
      !hasResearchedComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyResourceReqsID yet"
    );
    // should fail because alice has not researched DebugSimpleTechnologyNoReqsID
    researchSystem.executeTyped(DebugSimpleTechnologyResearchReqsID);

    // not enough resources
    vm.stopPrank();
  }

  function testResearchWithMainLevelRequirements() public {
    vm.startPrank(alice);

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(component(HasResearchedComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !hasResearchedComponent.has(
        LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))
      ),
      "alice should not have researched DebugSimpleTechnologyMainBaseLevelReqsID yet"
    );
    buildSystem.executeTyped(MainBaseID, Coord({ x: 0, y: 0 }));

    componentDevSystem.executeTyped(
      RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(MainBaseID, 2),
      abi.encode("")
    );
    upgradeSystem.executeTyped(Coord({ x: 0, y: 0 }));

    // should succeed because alice has upgraded their MainBase
    researchSystem.executeTyped(DebugSimpleTechnologyMainBaseLevelReqsID);
    assertTrue(
      hasResearchedComponent.has(
        LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))
      ),
      "alice should have researched DebugSimpleTechnologyMainBaseLevelReqsID"
    );
    // not enough resources
    vm.stopPrank();
  }

  function testFailResearchWithMainLevelRequirementsNotMet() public {
    vm.startPrank(alice);

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(component(HasResearchedComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !hasResearchedComponent.has(
        LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))
      ),
      "alice should not have researched DebugSimpleTechnologyMainBaseLevelReqsID yet"
    );
    buildSystem.executeTyped(MainBaseID, Coord({ x: 0, y: 0 }));

    // should fail because alice has not upgraded their MainBase
    researchSystem.executeTyped(DebugSimpleTechnologyMainBaseLevelReqsID);

    // not enough resources
    vm.stopPrank();
  }
}
