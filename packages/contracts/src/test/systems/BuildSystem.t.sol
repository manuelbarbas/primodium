// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildingTilesComponent, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BlueprintSystem, ID as BlueprintSystemID } from "../../systems/BlueprintSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DebugAquireResourcesSystem, ID as DebugAquireResourcesSystemID } from "../../systems/DebugAquireResourcesSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "../../components/BuildingTilesComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "../../components/BuildingComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "../../components/BuildingLimitComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
//debug buildings
import { MainBaseID, LithiumMinerID, DebugNodeID, MinerID, NodeID, DebugNodeID } from "../../prototypes/Tiles.sol";

//main buildings
import { BasicMinerID } from "../../prototypes/Tiles.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BlueprintSystem public blueprintSystem;
  BuildSystem public buildSystem;

  OwnedByComponent public ownedByComponent;
  BuildingTilesComponent public buildingTilesComponent;
  TileComponent public tileComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    blueprintSystem = BlueprintSystem(system(BlueprintSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));

    // init components
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    buildingTilesComponent = BuildingTilesComponent(component(BuildingTilesComponentID));
    tileComponent = TileComponent(component(TileComponentID));

    // init other
  }

  function testBuild() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    bytes memory blockEntity = buildSystem.executeTyped(LithiumMinerID, coord);

    uint256 blockEntityID = abi.decode(blockEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(blockEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(blockEntityID));
    assertEq(ownedByComponent.getValue(blockEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testBuildLargeBuilding() public {
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(dummyBuilding, blueprint);

    bytes memory blockEntity = buildSystem.executeTyped(dummyBuilding, coord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(blockEntityID);

    uint256[] memory buildingTiles = buildingTilesComponent.getValue(blockEntityID);
    assertEq(blueprint.length, buildingTiles.length);

    for (uint i = 0; i < buildingTiles.length; i++) {
      position = LibEncode.decodeCoordEntity(buildingTiles[i]);
      assertCoordEq(position, blueprint[i]);
      assertEq(blockEntityID, ownedByComponent.getValue(buildingTiles[i]));
      assertEq(dummyBuilding, tileComponent.getValue(buildingTiles[i]));
    }
  }

  function testBuildWithResourceRequirements() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    DebugAquireResourcesSystem debugAquireResourcesSystem = DebugAquireResourcesSystem(
      system(DebugAquireResourcesSystemID)
    );

    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );

    assertTrue(requiredResourcesComponent.has(BasicMinerID), "BasicMinerID should have resource requirements");
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(BasicMinerID);
    assertEq(resourceRequirements.length, 1, "BasicMinerID should have 1 resource requirement");
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(resourceRequirements[i], BasicMinerID)
      );
      console.log("BasicMiner requires resource: %s of amount %s", resourceRequirements[i], resourceCost);
      debugAquireResourcesSystem.executeTyped(resourceRequirements[i], resourceCost);
    }
    bytes memory blockEntity = buildSystem.executeTyped(BasicMinerID, coord);

    uint256 blockEntityID = abi.decode(blockEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(blockEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(blockEntityID));
    assertEq(ownedByComponent.getValue(blockEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });
    buildSystem.executeTyped(LithiumMinerID, coord);
    buildSystem.executeTyped(LithiumMinerID, coord);

    vm.stopPrank();
  }

  function testFailBuildTwiceMainBase() public {
    vm.startPrank(alice);

    Coord memory coord1 = Coord({ x: 0, y: 0 });
    Coord memory coord2 = Coord({ x: 0, y: 1 });

    buildSystem.executeTyped(MainBaseID, coord1);
    buildSystem.executeTyped(MainBaseID, coord2);
    vm.stopPrank();
  }

  function testFailBuildMoreThenBuildLimit() public {
    vm.startPrank(alice);

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    int32 secondIncrement = 0;
    for (uint256 i = 0; i < buildLimit + 1; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement, y: secondIncrement });
      buildSystem.executeTyped(MinerID, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimit() public {
    vm.startPrank(alice);

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement, y: secondIncrement });
      buildSystem.executeTyped(MinerID, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndTransportNodes() public {
    vm.startPrank(alice);

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);

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

  function testBuildPath() public {
    vm.startPrank(alice);

    Coord memory startCoord = Coord({ x: 0, y: 0 });
    Coord memory endCoord = Coord({ x: 0, y: 1 });

    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    PathComponent pathComponent = PathComponent(component(PathComponentID));

    // Build two conveyor blocks
    bytes memory startBlockEntity = buildSystem.executeTyped(DebugNodeID, startCoord);
    bytes memory endBlockEntity = buildSystem.executeTyped(DebugNodeID, endCoord);

    uint256 startBlockEntityID = abi.decode(startBlockEntity, (uint256));
    uint256 endBlockEntityID = abi.decode(endBlockEntity, (uint256));

    Coord memory startPosition = LibEncode.decodeCoordEntity(startBlockEntityID);
    assertEq(startPosition.x, startCoord.x);
    assertEq(startPosition.y, startCoord.y);

    Coord memory endPosition = LibEncode.decodeCoordEntity(endBlockEntityID);
    assertEq(endPosition.x, endCoord.x);
    assertEq(endPosition.y, endCoord.y);

    assertTrue(ownedByComponent.has(startBlockEntityID));
    assertEq(ownedByComponent.getValue(startBlockEntityID), addressToEntity(alice));

    assertTrue(ownedByComponent.has(endBlockEntityID));
    assertEq(ownedByComponent.getValue(endBlockEntityID), addressToEntity(alice));

    // Build a path
    buildPathSystem.executeTyped(startCoord, endCoord);
    assertEq(pathComponent.getValue(startBlockEntityID), endBlockEntityID);

    vm.stopPrank();
  }
}
