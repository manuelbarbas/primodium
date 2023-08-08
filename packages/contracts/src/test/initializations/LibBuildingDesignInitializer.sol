// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "../../components/P_RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { Coord } from "../../types.sol";

// in-game blocks/factories
import { MainBaseID } from "../../prototypes.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibBuildingDesignInitializerTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuildingsHaveCorrectRequirements() public {
    vm.startPrank(alice);
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      component(P_RequiredResourcesComponentID)
    );
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      component(P_RequiredResearchComponentID)
    );
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    vm.stopPrank();
  }
}
