// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { ClaimFromFactorySystem, ID as ClaimFromFactorySystemID } from "../../systems/ClaimFromFactorySystem.sol";
import { CraftSystem, ID as CraftSystemID } from "../../systems/CraftSystem.sol";
import { ResearchSystem, ID as ResearchSystemID } from "../../systems/ResearchSystem.sol";
import { DebugAquireResourcesSystem, ID as DebugAquireResourcesSystemID } from "../../systems/DebugAquireResourcesSystem.sol";
import { DebugAquireResourcesBasedOnRequirementSystem, ID as DebugAquireResourcesBasedOnRequirementSystemID } from "../../systems/DebugAquireResourcesBasedOnRequirementSystem.sol";
import { DebugRemoveUpgradeRequirementsSystem, ID as DebugRemoveUpgradeRequirementsSystemID } from "../../systems/DebugRemoveUpgradeRequirementsSystem.sol";
import { ResearchComponent, ID as ResearchComponentID } from "../../components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "../../components/BuildingComponent.sol";
import { IronResourceItemID, CopperResourceItemID, LithiumResourceItemID, IronPlateCraftedItemID } from "../../prototypes/Keys.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

import { MainBaseID, IronID, CopperID, LithiumID } from "../../prototypes/Tiles.sol";
import { FastMinerResearchID, LithiumResearchID } from "../../prototypes/Keys.sol";

import { DebugSimpleBuildingWithUpgradeResearchReqsID, DebugSimpleBuildingResearchReqsID, DebugSimpleTechnologyNoReqsID, DebugSimpleTechnologyResourceReqsID, DebugSimpleTechnologyResearchReqsID, DebugSimpleTechnologyMainBaseLevelReqsID } from "../../libraries/LibDebugInitializer.sol";

contract ResearchSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
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

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    DebugAquireResourcesBasedOnRequirementSystem debugAquireResourcesBasedOnRequirementSystem = DebugAquireResourcesBasedOnRequirementSystem(
        system(DebugAquireResourcesBasedOnRequirementSystemID)
      );
    debugAquireResourcesBasedOnRequirementSystem.executeTyped(DebugSimpleTechnologyResourceReqsID);
    // alice researches DebugSimpleTechnologyResourceReqsID
    researchSystem.executeTyped(DebugSimpleTechnologyResourceReqsID);
    assertTrue(
      researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResourceReqsID, addressToEntity(alice))),
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

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyNoReqsID yet"
    );
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyResearchReqsID yet"
    );
    researchSystem.executeTyped(DebugSimpleTechnologyNoReqsID);
    assertTrue(
      researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyNoReqsID"
    );

    researchSystem.executeTyped(DebugSimpleTechnologyResearchReqsID);
    assertTrue(
      researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyResearchReqsID"
    );
    // not enough resources
    vm.stopPrank();
  }

  function testFailResearchWithResearchRequirementsNotMet() public {
    vm.startPrank(alice);

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyNoReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyNoReqsID yet"
    );
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyResearchReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyResourceReqsID yet"
    );
    // should fail because alice has not researched DebugSimpleTechnologyNoReqsID
    researchSystem.executeTyped(DebugSimpleTechnologyResearchReqsID);

    // not enough resources
    vm.stopPrank();
  }

  function testResearchWithMainBuildingLevelRequirements() public {
    vm.startPrank(alice);

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    DebugRemoveUpgradeRequirementsSystem debugRemoveUpgradeRequirementsSystem = DebugRemoveUpgradeRequirementsSystem(
      system(DebugRemoveUpgradeRequirementsSystemID)
    );
    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyMainBaseLevelReqsID yet"
    );
    buildSystem.executeTyped(MainBaseID, Coord({ x: 0, y: 0 }));
    debugRemoveUpgradeRequirementsSystem.executeTyped(MainBaseID);
    upgradeSystem.executeTyped(Coord({ x: 0, y: 0 }));

    // should succeed because alice has upgraded their MainBase
    researchSystem.executeTyped(DebugSimpleTechnologyMainBaseLevelReqsID);
    assertTrue(
      researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))),
      "alice should have researched DebugSimpleTechnologyMainBaseLevelReqsID"
    );
    // not enough resources
    vm.stopPrank();
  }

  function testFailResearchWithMainBuildingLevelRequirementsNotMet() public {
    vm.startPrank(alice);

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    // alice researches DebugSimpleTechnologyResourceReqsID
    assertTrue(
      !researchComponent.has(LibEncode.hashKeyEntity(DebugSimpleTechnologyMainBaseLevelReqsID, addressToEntity(alice))),
      "alice should not have researched DebugSimpleTechnologyMainBaseLevelReqsID yet"
    );
    buildSystem.executeTyped(MainBaseID, Coord({ x: 0, y: 0 }));

    // should fail because alice has not upgraded their MainBase
    researchSystem.executeTyped(DebugSimpleTechnologyMainBaseLevelReqsID);

    // not enough resources
    vm.stopPrank();
  }
}
