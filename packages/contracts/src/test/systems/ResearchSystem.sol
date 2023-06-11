// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { entityToAddress, addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { ClaimFromFactorySystem, ID as ClaimFromFactorySystemID } from "../../systems/ClaimFromFactorySystem.sol";
import { CraftSystem, ID as CraftSystemID } from "../../systems/CraftSystem.sol";
import { ResearchSystem, ID as ResearchSystemID } from "../../systems/ResearchSystem.sol";

import { ResearchComponent, ID as ResearchComponentID } from "../../components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { IronResourceItemID, CopperResourceItemID, IronPlateCraftedItemID } from "../../prototypes/Keys.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

import { MainBaseID, DebugNodeID, MinerID, IronID, CopperID, DebugPlatingFactoryID } from "../../prototypes/Tiles.sol";
import { FastMinerResearchID, LithiumResearchID } from "../../prototypes/Keys.sol";

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

  function testFailResearchFastMiner() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    // alice researches fast miner
    researchSystem.executeTyped(FastMinerResearchID);
    // not enough resources
    vm.stopPrank();
  }

  // adapted from testClaim
  function testResearchFastMiner() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));

    // ================================================================================================
    // Resource and crafted components
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    uint256 hashedAliceIronKey = LibEncode.hashFromAddress(IronID, alice);
    uint256 hashedAliceCopperKey = LibEncode.hashFromAddress(CopperID, alice);

    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    uint256 hashedAliceFastMinerKey = LibEncode.hashFromAddress(FastMinerResearchID, alice);

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    assertEq(LibTerrain.getTopLayerKey(CopperCoord), CopperID);

    Coord memory mainBaseCoord = Coord({ x: -5, y: -4 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    // Copper to main base
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, CopperCoord);

    // Iron to main base
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);

    assertTrue(itemComponent.has(hashedAliceCopperKey));
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 100);
    assertEq(itemComponent.getValue(hashedAliceIronKey), 100);

    // ================================================================================================
    // alice researches fast miner
    researchSystem.executeTyped(FastMinerResearchID);

    assertTrue(researchComponent.has(hashedAliceFastMinerKey));
    assertTrue(researchComponent.getValue(hashedAliceFastMinerKey));
    assertEq(itemComponent.getValue(hashedAliceIronKey), 0);
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 0);

    vm.stopPrank();
  }

  // adapted from testClaimFactoryCraft;
  function testLithiumResearchTimeline() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ClaimFromFactorySystem claimFactorySystem = ClaimFromFactorySystem(system(ClaimFromFactorySystemID));
    CraftSystem craftSystem = CraftSystem(system(CraftSystemID));

    // Resource and crafted components
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    // Coord memory IronCoord = Coord({ x: -5, y: 2 });
    // Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -5, y: 2 })), IronID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -10, y: -4 })), CopperID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    Coord memory platingFactoryCoord = Coord({ x: -5, y: -4 });
    bytes memory platingFactoryEntity = buildSystem.executeTyped(DebugPlatingFactoryID, platingFactoryCoord);
    uint256 platingFactoryID = abi.decode(platingFactoryEntity, (uint256));

    uint256 hashedPlatingFactoryKeyIron = LibEncode.hashFromAddress(
      IronResourceItemID,
      entityToAddress(platingFactoryID)
    );
    uint256 hashedPlatingFactoryKeyCopper = LibEncode.hashFromAddress(
      CopperResourceItemID,
      entityToAddress(platingFactoryID)
    );
    uint256 hashedPlatingFactoryKeyIronPlate = LibEncode.hashFromAddress(
      IronPlateCraftedItemID,
      entityToAddress(platingFactoryID)
    );

    // Copper to BulletFactory
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, Coord({ x: -10, y: -4 }));

    vm.roll(10);

    claimSystem.executeTyped(platingFactoryCoord);
    claimFactorySystem.executeTyped(platingFactoryCoord);
    craftSystem.executeTyped(platingFactoryCoord);

    // all three values exist because they are set when we craft items in the factory in craftSystem.
    // even when there are no bullets
    assertTrue(itemComponent.has(hashedPlatingFactoryKeyIron));
    assertTrue(itemComponent.has(hashedPlatingFactoryKeyCopper));
    assertTrue(itemComponent.has(hashedPlatingFactoryKeyIronPlate));

    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIronPlate), 0);

    // Iron to BulletFactory
    buildSystem.executeTyped(MinerID, Coord({ x: -5, y: 2 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(20);

    claimSystem.executeTyped(platingFactoryCoord);
    claimFactorySystem.executeTyped(platingFactoryCoord);
    craftSystem.executeTyped(platingFactoryCoord);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIronPlate), 100);

    // BulletFactory to MainBase
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -4, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -1, y: 0 }));
    buildPathSystem.executeTyped(Coord({ x: -4, y: -4 }), Coord({ x: -1, y: 0 }));

    vm.roll(30);

    claimSystem.executeTyped(platingFactoryCoord);
    claimFactorySystem.executeTyped(platingFactoryCoord);
    craftSystem.executeTyped(platingFactoryCoord);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIronPlate), 200);

    vm.roll(40);

    claimSystem.executeTyped(platingFactoryCoord);
    claimFactorySystem.executeTyped(platingFactoryCoord);
    craftSystem.executeTyped(platingFactoryCoord);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIronPlate), 300);

    claimSystem.executeTyped(mainBaseCoord);
    claimFactorySystem.executeTyped(mainBaseCoord);

    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyCopper), 0);
    assertEq(itemComponent.getValue(hashedPlatingFactoryKeyIronPlate), 0);

    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)), 100);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronPlateCraftedItemID, alice)), 300);

    // BEGIN UNIQUE SEGMENT FOR THIS TEST:

    // Research Lithium, validate research success, and check that resources has been deducted (20 IronPlate, 100 Copper)
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    console.log("Research lithium");
    researchSystem.executeTyped(LithiumResearchID);
    console.log("Researched lithium");
    assertTrue(researchComponent.has(LibEncode.hashFromAddress(LithiumResearchID, alice)));
    assertTrue(researchComponent.getValue(LibEncode.hashFromAddress(LithiumResearchID, alice)));

    console.log("Resource item");
    console.log(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)));
    console.log(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)));
    console.log(itemComponent.getValue(LibEncode.hashFromAddress(IronPlateCraftedItemID, alice)));

    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronPlateCraftedItemID, alice)), 280);

    vm.stopPrank();
  }
}
