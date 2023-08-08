// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "../../components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { Coord } from "../../types.sol";

// in-game blocks/factories
import { MainBaseID } from "../../prototypes.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibBuildingDesignInitializerTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuildingsHaveCorrectRequirements() public {
    vm.startPrank(alice);
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      component(RequiredResearchComponentID)
    );
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    vm.stopPrank();
  }
}
