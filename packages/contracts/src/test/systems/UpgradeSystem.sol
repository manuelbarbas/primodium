// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";
import { DebugAquireResourcesSystem, ID as DebugAquireResourcesSystemID } from "../../systems/DebugAquireResourcesSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "../../components/BuildingComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { MainBaseID, LithiumMinerID, DebugNodeID, MinerID, NodeID, DebugNodeID } from "../../prototypes/Tiles.sol";
import { Coord } from "../../types.sol";
import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";

contract UpgradeSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testUpgrade() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    DebugAquireResourcesSystem debugAquireResourcesSystem = DebugAquireResourcesSystem(
      system(DebugAquireResourcesSystemID)
    );

    BuildingComponent buildingComponent = BuildingComponent(component(BuildingComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    console.log("building MainBase");
    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, coord);
    console.log("MainBase built");
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    console.log("get built MainBase entity id ");
    assertTrue(buildingComponent.has(blockEntityID), "MainBase entity id should have building component");
    assertTrue(buildingComponent.getValue(blockEntityID) == 1, "MainBase entity id should be level 1");
    console.log("upgrading MainBase to level 2");
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(LibEncode.hashFromKey(MainBaseID, 2));
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(resourceRequirements[i], LibEncode.hashFromKey(MainBaseID, 2))
      );
      console.log("MainBase level 2 requires resource: %s of amount %s", resourceRequirements[i], resourceCost);
      debugAquireResourcesSystem.executeTyped(resourceRequirements[i], resourceCost);
      console.log("%s of amount %s provided to player", resourceRequirements[i], resourceCost);
    }
    upgradeSystem.executeTyped(coord);
    assertTrue(buildingComponent.getValue(blockEntityID) == 2);

    vm.stopPrank();
  }

  function testFailUpgradeResourceRequirementsNotMet() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    BuildingComponent buildingComponent = BuildingComponent(component(BuildingComponentID));

    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    assertTrue(buildingComponent.has(blockEntityID));
    assertTrue(buildingComponent.getValue(blockEntityID) == 1);

    upgradeSystem.executeTyped(coord);
    vm.stopPrank();
  }
}
