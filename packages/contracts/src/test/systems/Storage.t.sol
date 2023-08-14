// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";

import { addressToEntity, entityToAddress } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DestroyPathSystem, ID as DestroyPathSystemID } from "../../systems/DestroyPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../../components/P_MaxStorageComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import "../../prototypes.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibStorage } from "../../libraries/LibStorage.sol";
import { Coord } from "../../types.sol";

contract Storage is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    spawn(alice);
  }

  function testStorage() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getOrigin(alice);

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");

    uint256 ironCapacity = LibStorage.getResourceStorageSpace(world, addressToEntity(alice), IronID);
    console.log("alice has ironCapacity of %s", ironCapacity);

    vm.roll(ironCapacity);
    claimSystem.executeTyped(coord);
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    vm.roll(10);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    vm.roll(30);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    vm.stopPrank();
  }

  function testStorageAfterUpgrade() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getOrigin(alice);

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    uint256 ironCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);
    console.log("alice has ironCapacity of %s", ironCapacity);
    // START CLAIMING
    uint256 currBlockNum = 0;
    vm.roll(0);

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");

    console.log("alice has ironCapacity of %s", ironCapacity);

    currBlockNum += ironCapacity;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(coord);
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    currBlockNum += 10;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(itemComponent.getValue(hashedAliceKey), ironCapacity, "Alice should have max storage capacity iron");

    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(MainBaseID, 2),
      abi.encode()
    );

    upgradeBuildingSystem.executeTyped(mainBaseCoord);
    uint256 newIronCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);
    console.log("alice has newIronCapacity of %s", newIronCapacity);
    currBlockNum += 10;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base before new capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(
      itemComponent.getValue(hashedAliceKey),
      ironCapacity + 10,
      "Alice should have 10 more then its last capacity"
    );

    assertTrue(newIronCapacity > ironCapacity, "new capacity should be greater then old capacity");
    currBlockNum += newIronCapacity;
    currBlockNum -= ironCapacity;
    currBlockNum -= 20;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base before new capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(
      itemComponent.getValue(hashedAliceKey),
      newIronCapacity - 10,
      "Alice should have 10 less then max storage capacity iron"
    );

    currBlockNum += 10;
    vm.roll(currBlockNum);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after new capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(itemComponent.getValue(hashedAliceKey), newIronCapacity, "Alice should have max storage capacity iron");

    currBlockNum += 10;
    vm.roll(currBlockNum);
    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base after new capacity full %s", itemComponent.getValue(hashedAliceKey));
    assertEq(itemComponent.getValue(hashedAliceKey), newIronCapacity, "Alice should have max storage capacity iron");

    vm.stopPrank();
  }

  function testStorageAfterDestroy() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = getIronCoord(alice);
    assertEq(LibTerrain.getResourceByCoord(world, coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = getOrigin(alice);

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    uint256 ironCapacity = LibStorage.getResourceMaxStorage(world, addressToEntity(alice), IronID);
    console.log("alice has ironCapacity of %s", ironCapacity);
    // START CLAIMING
    uint256 currBlockNum = 0;
    vm.roll(0);

    buildSystem.executeTyped(DebugIronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");

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
    vm.stopPrank();
  }
}
