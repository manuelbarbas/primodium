// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { StarterPackSystem, ID as StarterPackSystemID } from "../../systems/StarterPackSystem.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { Coord } from "../../types.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";

import { IronResourceItemID } from "../../prototypes/Keys.sol";

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
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    assertEq(itemComponent.getValue(LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(alice))), 200);
    vm.stopPrank();
  }

  function testClaimStarterPack() public {
    vm.startPrank(alice);
    StarterPackSystem starterPackSystem = StarterPackSystem(system(StarterPackSystemID));
    starterPackSystem.executeTyped();
    vm.stopPrank();
  }
}
