// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { StarterPackSystem, ID as StarterPackSystemID } from "../../systems/StarterPackSystem.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "../../components/IronResourceComponent.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testClaimStarterPackTwiceFail() public {
    vm.startPrank(alice);
    StarterPackSystem starterPackSystem = StarterPackSystem(system(StarterPackSystemID));
    starterPackSystem.executeTyped();
    starterPackSystem.executeTyped();
    starterPackSystem.executeTyped();
    starterPackSystem.executeTyped();
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 200);
    vm.stopPrank();
  }

  function testClaimStarterPack() public {
    vm.startPrank(alice);
    StarterPackSystem starterPackSystem = StarterPackSystem(system(StarterPackSystemID));
    starterPackSystem.executeTyped();
    vm.stopPrank();
  }
}
