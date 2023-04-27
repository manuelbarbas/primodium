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

import { IronResourceComponent, ID as IronResourceComponentID } from "../../components/IronResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "../../components/CopperResourceComponent.sol";
import { FastMinerResearchComponent, ID as FastMinerResearchComponentID } from "../../components/FastMinerResearchComponent.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { Coord } from "../../types.sol";

import { MainBaseID, ConveyorID, MinerID, IronID, CopperID } from "../../prototypes/Tiles.sol";

contract ResearchSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testFailResearchFastMiner() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    FastMinerResearchComponent fastMinerResearchComponent = FastMinerResearchComponent(
      component(FastMinerResearchComponentID)
    );

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));

    // alice researches fast miner
    researchSystem.executeTyped(FastMinerResearchComponentID);
    // not enough resources
    vm.stopPrank();
  }

  // adapted from testClaim
  function testResearchFastMiner() public {
    vm.startPrank(alice);

    ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));
    FastMinerResearchComponent fastMinerResearchComponent = FastMinerResearchComponent(
      component(FastMinerResearchComponentID)
    );

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));

    // ================================================================================================
    // Resource and crafted components
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));
    CopperResourceComponent copperResourceComponent = CopperResourceComponent(component(CopperResourceComponentID));

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    assertEq(LibTerrain.getTopLayerKey(CopperCoord), CopperID);

    Coord memory mainBaseCoord = Coord({ x: -5, y: -4 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    // Copper to main base
    buildSystem.executeTyped(ConveyorID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, CopperCoord);

    // Iron to main base
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(ConveyorID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);

    assertTrue(copperResourceComponent.has(addressToEntity(alice)));
    assertEq(copperResourceComponent.getValue(addressToEntity(alice)), 100);
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 100);

    // ================================================================================================
    // alice researches fast miner
    researchSystem.executeTyped(FastMinerResearchComponentID);

    assertTrue(fastMinerResearchComponent.has(addressToEntity(alice)));
    assertTrue(fastMinerResearchComponent.getValue(addressToEntity(alice)));
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 0);
    assertEq(copperResourceComponent.getValue(addressToEntity(alice)), 0);

    vm.stopPrank();
  }
}
