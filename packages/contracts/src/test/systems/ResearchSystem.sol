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

import { IronResourceItemID, CopperResourceItemID, LithiumResourceItemID, IronPlateCraftedItemID } from "../../prototypes/Keys.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

import { MainBaseID, DebugNodeID, MinerID, IronID, CopperID, LithiumID, DebugPlatingFactoryID } from "../../prototypes/Tiles.sol";
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
  function testLithiumMineThenResearch() public {
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

    // Copper to DebugIronPlateFactory
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

    // Iron to DebugIronPlateFactory
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

    // DebugIronPlateFactory to MainBase
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

    // ================================================================================================
    // BEGIN UNIQUE SEGMENT FOR THIS TEST:
    Coord memory lithiumCoord = Coord({ x: 23, y: 6 });
    assertEq(LibTerrain.getTopLayerKey(lithiumCoord), LithiumID);

    vm.roll(100);
    // build mine at the lithiumCoord and connect to the main base
    buildSystem.executeTyped(MinerID, lithiumCoord);
    buildSystem.executeTyped(DebugNodeID, Coord({ x: 23, y: 5 }));
    buildPathSystem.executeTyped(Coord({ x: 23, y: 5 }), Coord({ x: -1, y: 0 }));

    // research lithium
    vm.roll(110);
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    researchSystem.executeTyped(LithiumResearchID);
    assertTrue(researchComponent.has(LibEncode.hashFromAddress(LithiumResearchID, alice)));
    assertTrue(researchComponent.getValue(LibEncode.hashFromAddress(LithiumResearchID, alice)));

    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronPlateCraftedItemID, alice)), 280);

    // mine lithium (expected 110 -> 120 => (120 - 110) * 10 = 100 lithium)
    vm.roll(120);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(LithiumResourceItemID, alice)), 100);

    vm.stopPrank();
  }

  // adapted from testClaimFactoryCraft;
  function testLithiumResearchThenMine() public {
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

    // Copper to DebugIronPlateFactory
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

    // Iron to DebugIronPlateFactory
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

    // DebugIronPlateFactory to MainBase
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

    // ================================================================================================
    // BEGIN UNIQUE SEGMENT FOR THIS TEST:
    Coord memory lithiumCoord = Coord({ x: 23, y: 6 });
    assertEq(LibTerrain.getTopLayerKey(lithiumCoord), LithiumID);

    // research lithium
    vm.roll(100);
    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    ResearchComponent researchComponent = ResearchComponent(component(ResearchComponentID));
    researchSystem.executeTyped(LithiumResearchID);
    assertTrue(researchComponent.has(LibEncode.hashFromAddress(LithiumResearchID, alice)));
    assertTrue(researchComponent.getValue(LibEncode.hashFromAddress(LithiumResearchID, alice)));

    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronPlateCraftedItemID, alice)), 280);

    vm.roll(110);
    // build mine at the lithiumCoord and connect to the main base
    buildSystem.executeTyped(MinerID, lithiumCoord);
    buildSystem.executeTyped(DebugNodeID, Coord({ x: 23, y: 5 }));
    buildPathSystem.executeTyped(Coord({ x: 23, y: 5 }), Coord({ x: -1, y: 0 }));

    // mine lithium (expected 110 -> 120 => (120 - 110) * 10 = 100 lithium)
    vm.roll(120);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(LithiumResourceItemID, alice)), 100);

    vm.stopPrank();
  }
}
