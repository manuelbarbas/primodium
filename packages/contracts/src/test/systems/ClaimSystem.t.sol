// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "../../components/ProductionComponent.sol";
import { ScoreComponent, ID as ScoreComponentID } from "../../components/ScoreComponent.sol";
import { P_ScoreMultiplierComponent, ID as P_ScoreMultiplierComponentID } from "../../components/P_ScoreMultiplierComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "../../components/P_RequiredResearchComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "../../components/P_MaxResourceStorageComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../../components/P_MaxStorageComponent.sol";
import "../../prototypes.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { Coord } from "../../types.sol";

contract ClaimSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ScoreComponent public scoreComponent;
  P_ScoreMultiplierComponent public scoreMultiplierComponent;

  function setUp() public override {
    super.setUp();
    scoreComponent = ScoreComponent(component(ScoreComponentID));
    scoreMultiplierComponent = P_ScoreMultiplierComponent(component(P_ScoreMultiplierComponentID));
    spawn(alice);
  }

  function testClaimOnFactory() public {
    vm.startPrank(alice);
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getMainBaseCoord(alice);
    Coord memory platingFactoryCoord = getCoord1(alice);

    console.log("built main base");
    vm.roll(0);
    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugIronMineID, 1),
      abi.encode()
    );

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");
    vm.roll(0);
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1),
      abi.encode()
    );
    buildSystem.executeTyped(DebugIronPlateFactoryID, platingFactoryCoord);
    vm.roll(0);
    // START CLAIMING

    vm.roll(10);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    uint256 hashedAliceIronPlateKey = LibEncode.hashKeyEntity(IronPlateCraftedItemID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceIronPlateKey), "Alice should have IronPlate");
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 20, "Alice should have 20 IronPlates");

    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);

    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 40, "Alice should have 40 IronPlates");
    vm.roll(30);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 60, "Alice should have 60 IronPlates");
    assertTrue(
      !itemComponent.has(hashedAliceIronKey) || itemComponent.getValue(hashedAliceIronKey) <= 0,
      "Alice should not have any Iron"
    );

    vm.stopPrank();
  }

  function testClaimOnFactoryUpgrade() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getMainBaseCoord(alice);
    Coord memory platingFactoryCoord = getCoord1(alice);

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1),
      abi.encode()
    );
    console.log("removed resource requirements");
    console.log(
      P_RequiredResourcesComponent(component(P_RequiredResourcesComponentID)).has(
        LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1)
      )
    );

    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    uint256 hashedAliceIronPlateKey = LibEncode.hashKeyEntity(IronPlateCraftedItemID, addressToEntity(alice));
    vm.roll(0);
    ProductionComponent productionComponent = ProductionComponent(component(ProductionComponentID));
    buildSystem.executeTyped(DebugIronMineID, coord);
    assertEq(LibMath.getSafe(productionComponent, hashedAliceIronKey), 1, "Alice should have 1 Iron Production");
    console.log("built IronMineID");
    buildSystem.executeTyped(DebugIronPlateFactoryID, platingFactoryCoord);
    assertEq(LibMath.getSafe(productionComponent, hashedAliceIronKey), 0, "Alice should have 0 Iron Production");
    // START CLAIMING
    vm.roll(0);

    console.log("built path from PlatingFactory to MainBase");
    console.log(
      "Iron PLate Production is %s",
      ProductionComponent(component(ProductionComponentID)).getValue(
        LibEncode.hashKeyEntity(IronPlateCraftedItemID, addressToEntity(alice))
      )
    );
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    assertTrue(itemComponent.has(hashedAliceIronPlateKey), "Alice should have IronPlate");
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 20, "Alice should have 20 IronPlates");
    vm.roll(20);
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));

    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 2),
      abi.encode()
    );
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(LibMath.getSafe(productionComponent, hashedAliceIronKey), 1, "Alice should have 1 Iron Production");
    upgradeBuildingSystem.executeTyped(platingFactoryCoord);
    assertEq(LibMath.getSafe(productionComponent, hashedAliceIronKey), 0, "Alice should have 0 Iron Production");
    console.log("upgraded factory");
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 40, "Alice should have 40 IronPlates");

    vm.roll(50);
    claimSystem.executeTyped(mainBaseCoord);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed after factory upgrade");
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 160, "Alice should have 180 IronPlates");

    console.log("upgraded mine");
    vm.roll(100);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed after upgraded mine");
    assertEq(itemComponent.getValue(hashedAliceIronPlateKey), 360, "Alice should have 360 IronPlates");

    vm.stopPrank();
  }

  function testClaimOnUpgrade() public {
    vm.startPrank(alice);

    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getMainBaseCoord(alice);

    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");

    console.log("built path from IronMine to main base");
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), 10, "Alice should have 10 iron");

    upgradeBuildingSystem.executeTyped(coord);

    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 2, "IronMine should be level 2");
    vm.roll(20);

    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 30, "Alice should have 30 iron");
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 3, "IronMine should be level 3");

    vm.roll(30);

    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 60, "Alice should have 60 iron");

    vm.stopPrank();
  }

  // claim two resources
  function testClaimTwoResources() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));

    // Resource and crafted components
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    Coord memory ironCoord = getIronCoord(alice);
    Coord memory copperCoord = getCopperCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, ironCoord), IronID, "Tile should have iron");
    assertEq(LibTerrain.getResourceByCoord(world, copperCoord), CopperID, "Tile should have copper");

    Coord memory mainBaseCoord = getMainBaseCoord(alice);

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugIronMineID, 1),
      abi.encode()
    );
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(DebugCopperMineID, 1),
      abi.encode()
    );
    vm.roll(0);
    //gain capacity for all resources so can store copper
    buildSystem.executeTyped(DebugIronMineID, ironCoord);

    buildSystem.executeTyped(DebugCopperMineID, copperCoord);

    vm.roll(0);
    // START CLAIMING

    vm.roll(20);

    claimSystem.executeTyped(mainBaseCoord);
    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    uint256 hashedAliceCopperKey = LibEncode.hashKeyEntity(CopperID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceIronKey), "Alice should have iron");
    assertTrue(itemComponent.has(hashedAliceCopperKey), "Alice should have copper");
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 60, "Alice should have 60 copper");
    assertEq(itemComponent.getValue(hashedAliceIronKey), 20, "Alice should have 20 iron");

    vm.stopPrank();
  }
}
