// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { ResearchSystem, ID as ResearchSystemID } from "../../systems/ResearchSystem.sol";

import { IronResourceComponent, ID as IronResourceComponentID } from "../../components/IronResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "../../components/CopperResourceComponent.sol";
import { FastMinerResearchComponent, ID as FastMinerResearchComponentID } from "../../components/FastMinerResearchComponent.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { Coord } from "../../types.sol";

contract ResearchSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  // adapted from testClaim
  // function testResearchFastMiner() public {
  //   ResearchSystem researchSystem = ResearchSystem(system(ResearchSystemID));

  //   IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));
  //   CopperResourceComponent copperResourceComponent = CopperResourceComponent(component(CopperResourceComponentID));
  //   FastMinerResearchComponent fastMinerResearchComponent = FastMinerResearchComponent(
  //     component(FastMinerResearchComponentID)
  //   );

  //   vm.startPrank(alice);

  //   // give 50 iron and 50 copper to alice
  //   // ================================================================================================
  //   ironResourceComponent.set(addressToEntity(alice), 50);
  //   copperResourceComponent.set(addressToEntity(alice), 50);
  //   // ================================================================================================

  //   // alice researches fast miner
  //   researchSystem.executeTyped(FastMinerResearchComponentID);

  //   // not enough resources
  //   assertTrue(!fastMinerResearchComponent.has(addressToEntity(alice)));
  //   assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 50);
  //   assertEq(copperResourceComponent.getValue(addressToEntity(alice)), 50);

  //   // give 100 iron and 100 copper to alice
  //   // ================================================================================================
  //   ironResourceComponent.set(addressToEntity(alice), 100);
  //   copperResourceComponent.set(addressToEntity(alice), 100);
  //   // ================================================================================================

  //   // alice researches fast miner
  //   researchSystem.executeTyped(FastMinerResearchComponentID);

  //   assertTrue(fastMinerResearchComponent.has(addressToEntity(alice)));
  //   assertTrue(fastMinerResearchComponent.getValue(addressToEntity(alice)));
  //   assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 0);
  //   assertEq(copperResourceComponent.getValue(addressToEntity(alice)), 0);
  // }
}
