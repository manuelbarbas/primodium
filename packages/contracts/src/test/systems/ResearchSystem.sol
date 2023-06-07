// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { ResearchSystem, ID as ResearchSystemID } from "../../systems/ResearchSystem.sol";

import { ResearchComponent, ID as ResearchComponentID } from "../../components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

import { MainBaseID, DebugNodeID, MinerID, IronID, CopperID } from "../../prototypes/Tiles.sol";
import { FastMinerResearchID } from "../../prototypes/Keys.sol";

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

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
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

    console.log("start claiming1");
    assertTrue(itemComponent.has(hashedAliceCopperKey));
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 100);
    assertEq(itemComponent.getValue(hashedAliceIronKey), 100);

    console.log("end claiming 1");
    // ================================================================================================
    // alice researches fast miner
    researchSystem.executeTyped(FastMinerResearchID);

    console.log("start claiming 2");
    console.log("alice has fastminer");
    assertTrue(researchComponent.has(hashedAliceFastMinerKey));
    console.log("alice has fastmine2r");
    assertTrue(researchComponent.getValue(hashedAliceFastMinerKey));
    console.log("alice has fastminer3");
    assertEq(itemComponent.getValue(hashedAliceIronKey), 0);
    console.log("alice has fastminer4");
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 0);

    console.log("end claiming 2");

    vm.stopPrank();
  }
}
