// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DestroyPathSystem, ID as DestroyPathSystemID } from "../../systems/DestroyPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "../../components/BuildingComponent.sol";
// import { MainBaseID, DebugNodeID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, IronMineID } from "../../prototypes/Tiles.sol";
import { MainBaseID, DebugNodeID, MinerID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";
import { BuildingKey } from "../../prototypes/Keys.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

contract ClaimSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testClaimOnBuildPath() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    // START CLAIMING
    vm.roll(0);
    buildSystem.executeTyped(IronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), 10, "Alice should have 10 iron");

    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 20, "Alice should have 20 iron");

    vm.roll(30);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 30, "Alice should have 30 iron");

    vm.stopPrank();
  }

  function testClaimOnDestroyPath() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    DestroyPathSystem destroyPathSystem = DestroyPathSystem(system(DestroyPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    // START CLAIMING
    vm.roll(0);
    buildSystem.executeTyped(IronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), 10, "Alice should have 100 iron");
    destroyPathSystem.executeTyped(coord);

    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 10, "Alice should have 200 iron");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    vm.roll(30);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 20, "Alice should have 300 iron");

    vm.stopPrank();
  }

  function testClaimOnUpgrade() public {
    vm.startPrank(alice);

    BuildingComponent buildingComponent = BuildingComponent(component(BuildingComponentID));

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID, "Tile should have iron");

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    console.log("built main base");
    // START CLAIMING
    vm.roll(0);
    buildSystem.executeTyped(IronMineID, coord);
    console.log("built IronMineID");
    buildPathSystem.executeTyped(coord, mainBaseCoord);
    console.log("built path from IronMine to main base");
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    console.log("claimed from main base");
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey), "Alice should have iron");
    assertEq(itemComponent.getValue(hashedAliceKey), 10, "Alice should have 30 iron");
    upgradeSystem.executeTyped(coord);
    assertEq(
      buildingComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)),
      2,
      "IronMine should be level 2"
    );
    vm.roll(20);

    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 30, "Alice should have 30 iron");
    upgradeSystem.executeTyped(coord);
    assertEq(
      buildingComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)),
      3,
      "IronMine should be level 3"
    );

    vm.roll(30);

    claimSystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedAliceKey), 60, "Alice should have 60 iron");

    vm.stopPrank();
  }

  function testClaimDuplicatePaths() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    Coord memory endPathCoord2 = Coord({ x: 0, y: 1 });
    Coord memory startPathCoord2 = Coord({ x: -4, y: 2 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    buildSystem.executeTyped(DebugNodeID, endPathCoord);
    buildSystem.executeTyped(DebugNodeID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    buildSystem.executeTyped(DebugNodeID, endPathCoord2);
    buildSystem.executeTyped(DebugNodeID, startPathCoord2);
    buildPathSystem.executeTyped(startPathCoord2, endPathCoord2);

    vm.roll(0);
    buildSystem.executeTyped(MinerID, coord);

    //
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    uint256 hashedAliceKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceKey));
    assertEq(itemComponent.getValue(hashedAliceKey), 100);

    vm.stopPrank();
  }

  // claim two resources
  function testClaimTwoResources() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));

    // Resource and crafted components
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    assertEq(LibTerrain.getTopLayerKey(CopperCoord), CopperID);

    Coord memory mainBaseCoord = Coord({ x: -5, y: -4 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    // Copper to main base
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, CopperCoord);

    // Iron to main base
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(20);

    claimSystem.executeTyped(mainBaseCoord);
    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    uint256 hashedAliceCopperKey = LibEncode.hashKeyEntity(CopperID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceCopperKey));
    assertEq(itemComponent.getValue(hashedAliceCopperKey), 200);
    assertEq(itemComponent.getValue(hashedAliceIronKey), 200);

    vm.stopPrank();
  }

  function testClaimAdjacentMinerNodeMainBase() public {
    vm.startPrank(alice);

    // a mainbase that is directly adjacent to a miner and node, no path
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    Coord memory nodeCoord = Coord({ x: -5, y: 1 });
    Coord memory mainBaseCoord = Coord({ x: -5, y: 0 });

    vm.roll(0);
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(DebugNodeID, nodeCoord);
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    // claim from main base
    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);

    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceIronKey));
    assertEq(itemComponent.getValue(hashedAliceIronKey), 200);

    vm.stopPrank();
  }

  // test case for same miner connected to main base from two distinct paths
  // should only claim resource once
  function testClaimMinerTwoPaths() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    Coord memory node1Coord1 = Coord({ x: -5, y: 1 });
    Coord memory node1Coord2 = Coord({ x: 0, y: 1 });
    Coord memory node2Coord1 = Coord({ x: -5, y: 3 });
    Coord memory node2Coord2 = Coord({ x: 0, y: -1 });
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });

    vm.roll(0);
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(DebugNodeID, node1Coord1);
    buildSystem.executeTyped(DebugNodeID, node1Coord2);
    buildSystem.executeTyped(DebugNodeID, node2Coord1);
    buildSystem.executeTyped(DebugNodeID, node2Coord2);
    buildPathSystem.executeTyped(node1Coord1, node1Coord2);
    buildPathSystem.executeTyped(node2Coord1, node2Coord2);
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    // claim from main base
    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);
    uint256 hashedAliceIronKey = LibEncode.hashKeyEntity(IronID, addressToEntity(alice));
    assertTrue(itemComponent.has(hashedAliceIronKey));
    assertEq(itemComponent.getValue(hashedAliceIronKey), 200);
    vm.stopPrank();
  }
}
