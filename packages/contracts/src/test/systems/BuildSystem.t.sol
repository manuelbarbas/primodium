// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildingTilesComponent, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BlueprintSystem, ID as BlueprintSystemID } from "../../systems/BlueprintSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DebugAcquireResourcesSystem, ID as DebugAcquireResourcesSystemID } from "../../systems/DebugAcquireResourcesSystem.sol";
import { DebugIgnoreBuildLimitForBuildingSystem, ID as DebugIgnoreBuildLimitForBuildingSystemID } from "../../systems/DebugIgnoreBuildLimitForBuildingSystem.sol";
import { DebugRemoveBuildLimitSystem, ID as DebugRemoveBuildLimitSystemID } from "../../systems/DebugRemoveBuildLimitSystem.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "../../components/BuildingTilesComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
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

import { DebugSimpleBuildingBuildLimitReq, DebugIronMineID, DebugIronMineWithBuildLimitID, DebugSimpleBuildingResourceReqsID, DebugSimpleBuildingNoReqsID } from "../../libraries/LibDebugInitializer.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";

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

  function buildMainBaseAtZero() internal returns (uint256) {
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    return blockEntityID;
  }

  function testBuildMainBase() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    bytes memory buildingEntity = buildSystem.executeTyped(LithiumMinerID, coord);

    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(buildingEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(buildingEntityID));
    assertEq(ownedByComponent.getValue(buildingEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testBuildLargeBuilding() public {
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(dummyBuilding, blueprint);

    bytes memory buildingEntity = buildSystem.executeTyped(dummyBuilding, coord);
    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(buildingEntityID);

    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntityID);
    assertEq(blueprint.length, buildingTiles.length);

    for (uint i = 0; i < buildingTiles.length; i++) {
      position = LibEncode.decodeCoordEntity(buildingTiles[i]);
      assertCoordEq(position, blueprint[i]);
      assertEq(buildingEntityID, ownedByComponent.getValue(buildingTiles[i]));
      assertEq(dummyBuilding, tileComponent.getValue(buildingTiles[i]));
    }
  }

  function testBuildWithResourceRequirements() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory ironCoord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(ironCoord), IronID, "Tile should have iron");

    bytes memory mainBaseEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 mainBaseEntityID = abi.decode(mainBaseEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(mainBaseEntityID);

    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(mainBaseEntityID));
    assertEq(ownedByComponent.getValue(mainBaseEntityID), addressToEntity(alice));

    bytes memory ironMineEntity = buildSystem.executeTyped(DebugIronMineWithBuildLimitID, ironCoord);
    uint256 ironMineEntityID = abi.decode(ironMineEntity, (uint256));
    position = LibEncode.decodeCoordEntity(ironMineEntityID);

    assertEq(position.x, ironCoord.x);
    assertEq(position.y, ironCoord.y);

    assertTrue(ownedByComponent.has(ironMineEntityID));
    assertEq(ownedByComponent.getValue(ironMineEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailTryBuildMineBeforeMainBase() public {
    vm.startPrank(alice);

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = Coord({ x: -6, y: 2 });
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

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

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceRequirements() public {
    vm.startPrank(alice);

    DebugAcquireResourcesSystem debugAcquireResourcesSystem = DebugAcquireResourcesSystem(
      system(DebugAcquireResourcesSystemID)
    );

    buildMainBaseAtZero();

    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );

    assertTrue(
      requiredResourcesComponent.has(DebugSimpleBuildingResourceReqsID),
      "DebugSimpleBuildingResourceReqs should have resource requirements"
    );
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(DebugSimpleBuildingResourceReqsID);
    assertEq(resourceRequirements.length, 1, "DebugSimpleBuildingResourceReqs should have 1 resource requirement");
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(resourceRequirements[i], DebugSimpleBuildingResourceReqsID)
      );
      console.log(
        "DebugSimpleBuildingResourceReqs requires resource: %s of amount %s",
        resourceRequirements[i],
        resourceCost
      );
      debugAcquireResourcesSystem.executeTyped(resourceRequirements[i], resourceCost);
    }
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory ironCoord = Coord({ x: -5, y: 2 });
    bytes memory buildingEntity = buildSystem.executeTyped(DebugSimpleBuildingResourceReqsID, ironCoord);

    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(buildingEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(buildingEntityID));
    assertEq(ownedByComponent.getValue(buildingEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public {
    vm.startPrank(alice);

    buildMainBaseAtZero();
    Coord memory coord = Coord({ x: 1, y: 1 });
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);

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
    buildMainBaseAtZero();
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    int32 secondIncrement = 0;
    for (uint256 i = 0; i < buildLimit + 1; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimit() public {
    vm.startPrank(alice);
    buildMainBaseAtZero();
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndBuildingWithIgnoreLimit() public {
    vm.startPrank(alice);

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));
    uint256 buildLimit = LibBuilding.getBuildCountLimit(buildingLimitComponent, 1);

    Coord memory coord1 = Coord({ x: -1, y: -1 });
    buildSystem.executeTyped(MainBaseID, coord1);

    coord1 = Coord({ x: -1, y: -2 });
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord1);

    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      coord1 = Coord({ x: secondIncrement, y: secondIncrement });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }
}
