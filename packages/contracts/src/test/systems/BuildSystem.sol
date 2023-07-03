// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DebugAquireResourcesSystem, ID as DebugAquireResourcesSystemID } from "../../systems/DebugAquireResourcesSystem.sol";
import { DebugIgnoreBuildLimitForBuildingSystem, ID as DebugIgnoreBuildLimitForBuildingSystemID } from "../../systems/DebugIgnoreBuildLimitForBuildingSystem.sol";
import { DebugRemoveBuildLimitSystem, ID as DebugRemoveBuildLimitSystemID } from "../../systems/DebugRemoveBuildLimitSystem.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "../../components/BuildingComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "../../components/BuildingLimitComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";
//debug buildings
import { MainBaseID } from "../../prototypes/Tiles.sol";

//main buildings
import { BasicMinerID, IronMineID } from "../../prototypes/Tiles.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";

contract BuildSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function buildMainBaseAtZero() internal returns (uint256) {
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    return blockEntityID;
  }

  function testBuildMainBase() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));

    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, coord);

    uint256 blockEntityID = abi.decode(blockEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(blockEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(blockEntityID));
    assertEq(ownedByComponent.getValue(blockEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testBuildMainBaseThenIronMine() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory ironCoord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(ironCoord), IronID, "Tile should have iron");
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));

    bytes memory mainBaseEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 mainBaseEntityID = abi.decode(mainBaseEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(mainBaseEntityID);

    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(mainBaseEntityID));
    assertEq(ownedByComponent.getValue(mainBaseEntityID), addressToEntity(alice));

    bytes memory ironMineEntity = buildSystem.executeTyped(IronMineID, coord);
    uint256 ironMineEntityID = abi.decode(ironMineEntity, (uint256));
    position = LibEncode.decodeCoordEntity(ironMineEntityID);

    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(ironMineEntityID));
    assertEq(ownedByComponent.getValue(ironMineEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailTryBuildMineBeforeMainBase() public {
    vm.startPrank(alice);

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = Coord({ x: -6, y: 2 });
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    bytes memory ironMineEntity = buildSystem.executeTyped(IronMineID, nonIronCoord);

    vm.stopPrank();
  }

  function testFailBuildIronMineOnNonIronTile() public {
    vm.startPrank(alice);

    //build main base
    buildMainBaseAtZero();

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = Coord({ x: -6, y: 2 });
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");

    DebugRemoveBuildLimitSystem debugRemoveBuildLimitSystem = DebugRemoveBuildLimitSystem(
      system(DebugRemoveBuildLimitSystemID)
    );
    debugRemoveBuildLimitSystem.executeTyped();
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    bytes memory ironMineEntity = buildSystem.executeTyped(IronMineID, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceRequirements() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    DebugAquireResourcesSystem debugAquireResourcesSystem = DebugAquireResourcesSystem(
      system(DebugAquireResourcesSystemID)
    );

    buildMainBaseAtZero();

    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );

    assertTrue(requiredResourcesComponent.has(BasicMinerID), "BasicMinerID should have resource requirements");
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(BasicMinerID);
    assertEq(resourceRequirements.length, 1, "BasicMinerID should have 1 resource requirement");
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(resourceRequirements[i], BasicMinerID)
      );
      console.log("BasicMiner requires resource: %s of amount %s", resourceRequirements[i], resourceCost);
      debugAquireResourcesSystem.executeTyped(resourceRequirements[i], resourceCost);
    }
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory ironCoord = Coord({ x: -5, y: 2 });
    bytes memory blockEntity = buildSystem.executeTyped(IronMineID, ironCoord);

    uint256 blockEntityID = abi.decode(blockEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(blockEntityID);
    assertEq(position.x, ironCoord.x);
    assertEq(position.y, ironCoord.y);

    assertTrue(ownedByComponent.has(blockEntityID));
    assertEq(ownedByComponent.getValue(blockEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public {
    vm.startPrank(alice);

    buildMainBaseAtZero();
    Coord memory coord = Coord({ x: 1, y: 1 });
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    buildSystem.executeTyped(LithiumMinerID, coord);
    buildSystem.executeTyped(LithiumMinerID, coord);

    vm.stopPrank();
  }

  function testFailBuildTwiceMainBase() public {
    vm.startPrank(alice);

    Coord memory coord1 = Coord({ x: 0, y: 0 });
    Coord memory coord2 = Coord({ x: 0, y: 1 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    buildSystem.executeTyped(MainBaseID, coord1);
    buildSystem.executeTyped(MainBaseID, coord2);
    vm.stopPrank();
  }

  function testFailBuildMoreThenBuildLimit() public {
    vm.startPrank(alice);
    buildMainBaseAtZero();
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    int32 secondIncrement = 0;
    for (uint256 i = 0; i < buildLimit + 1; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(MinerID, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimit() public {
    vm.startPrank(alice);
    buildMainBaseAtZero();
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(MinerID, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndTransportNodes() public {
    vm.startPrank(alice);

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));

    Coord memory coord1 = Coord({ x: -1, y: -1 });
    buildSystem.executeTyped(MainBaseID, coord1);

    coord1 = Coord({ x: -1, y: -2 });
    buildSystem.executeTyped(DebugNodeID, coord1);

    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      coord1 = Coord({ x: secondIncrement, y: secondIncrement });
      buildSystem.executeTyped(MinerID, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }
}
