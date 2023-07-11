// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";
import { DebugAcquireResourcesSystem, ID as DebugAcquireResourcesSystemID } from "../../systems/DebugAcquireResourcesSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BuildingLevelComponent, ID as BuildingComponentID } from "../../components/BuildingLevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { MainBaseID } from "../../prototypes/Tiles.sol";
import { Coord } from "../../types.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { PostUpgradeSystem, ID as PostUpgradeSystemID } from "../../systems/PostUpgradeSystem.sol";

contract UpgradeSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testFailCallPostUpgradeSystemFromUser() public {
    vm.startPrank(alice);
    PostUpgradeSystem postUpgradeSystem = PostUpgradeSystem(system(PostUpgradeSystemID));
    postUpgradeSystem.executeTyped(alice, addressToEntity(alice));
    vm.stopPrank();
  }
}
