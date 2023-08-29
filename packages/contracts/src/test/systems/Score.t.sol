// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";

import { addressToEntity, entityToAddress } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../../components/P_MaxStorageComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { P_ScoreMultiplierComponent, ID as P_ScoreMultiplierComponentID } from "../../components/P_ScoreMultiplierComponent.sol";
import { ScoreComponent, ID as ScoreComponentID } from "../../components/ScoreComponent.sol";
import "../../prototypes.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibStorage } from "../../libraries/LibStorage.sol";
import { Coord } from "../../types.sol";

contract Score is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ScoreComponent public scoreComponent;
  P_ScoreMultiplierComponent public scoreMultiplierComponent;

  function setUp() public override {
    super.setUp();
    scoreComponent = ScoreComponent(component(ScoreComponentID));
    scoreMultiplierComponent = P_ScoreMultiplierComponent(component(P_ScoreMultiplierComponentID));
    spawn(alice);
  }

  function testScoreStorage() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

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

    uint256 ironCapacity = LibStorage.getResourceStorageSpace(world, addressToEntity(alice), IronID);
    console.log("alice has ironCapacity of %s", ironCapacity);

    vm.roll(ironCapacity);
    claimSystem.executeTyped(coord);
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    uint256 score = scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceKey);
    console.log("score for %s Iron is %s", itemComponent.getValue(hashedAliceKey), score);
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");

    vm.roll(ironCapacity + 10);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");
    score = scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceKey);
    console.log("score for %s Iron is %s", itemComponent.getValue(hashedAliceKey), score);
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");

    vm.roll(ironCapacity + 20);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    score = scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceKey);
    console.log("score for %s Iron is %s", itemComponent.getValue(hashedAliceKey), score);
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");
    vm.roll(ironCapacity + 30);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    score = scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceKey);
    console.log("score for %s Iron is %s", itemComponent.getValue(hashedAliceKey), score);
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");
    vm.stopPrank();
  }

  function testScoreStorageAfterDestroy() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getMainBaseCoord(alice);

    uint256 ironCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);
    console.log("alice has ironCapacity of %s", ironCapacity);
    // START CLAIMING
    uint256 currBlockNum = 0;
    vm.roll(0);

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");

    console.log("alice has ironCapacity of %s", ironCapacity);

    currBlockNum += ironCapacity;

    vm.roll(currBlockNum);

    console.log("claiming ");
    claimSystem.executeTyped(coord);
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    console.log("building storage ");
    Coord memory storageBuildingCoord = getCoord1(alice);
    buildSystem.executeTyped(DebugStorageBuildingID, storageBuildingCoord);
    uint256 newIronCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);
    console.log("after building storage building alice has newIronCapacity of %s", newIronCapacity);
    assertTrue(newIronCapacity > ironCapacity, "new capacity should be greater then old capacity");
    currBlockNum += newIronCapacity;
    currBlockNum -= ironCapacity;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after new capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(
      itemComponent.getValue(hashedAliceKey),
      newIronCapacity,
      "Alice should have 10 less then max storage capacity iron"
    );

    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(storageBuildingCoord);
    console.log("destroyed storage building");
    uint256 afterDestroyIronCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);

    console.log("after destroying storage building alice has Iron capacity of %s", afterDestroyIronCapacity);
    console.log(
      "after destroying storage building alice has Iron amount of  %s",
      itemComponent.getValue(hashedAliceKey)
    );
    assertTrue(afterDestroyIronCapacity < newIronCapacity, "after destroy capacity should be less then before");
    assertEq(
      itemComponent.getValue(hashedAliceKey),
      afterDestroyIronCapacity,
      "Alice should have lost excess iron from storage decrease"
    );

    uint256 score = scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceKey);
    console.log("score for %s Iron is %s", itemComponent.getValue(hashedAliceKey), score);
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");
    vm.stopPrank();
  }

  // claim two resources
  function testScoreClaimTwoResources() public {
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

    uint256 score = 0;
    score += scoreMultiplierComponent.getValue(IronID) * itemComponent.getValue(hashedAliceIronKey);
    score += scoreMultiplierComponent.getValue(CopperID) * itemComponent.getValue(hashedAliceCopperKey);

    console.log(
      "score for %s Iron and %s Copper is %s",
      itemComponent.getValue(hashedAliceIronKey),
      itemComponent.getValue(hashedAliceCopperKey),
      score
    );
    assertEq(scoreComponent.getValue(addressToEntity(alice)), score, "score does not match");

    vm.stopPrank();
  }
}
