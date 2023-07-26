// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DebugAcquireResourcesSystem, ID as DebugAcquireResourcesSystemID } from "../../systems/DebugAcquireResourcesSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "../../components/MaxBuildingsComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
//debug buildings
import { MainBaseID } from "../../prototypes.sol";

//main buildings
import { DebugIronMineID } from "../../libraries/LibDebugInitializer.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";

contract BuildPathSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BuildSystem public buildSystem;
  BuildPathSystem public buildPathSystem;

  OwnedByComponent public ownedByComponent;
  PathComponent public pathComponent;
  TileComponent public tileComponent;

  Coord public startCoord = Coord({ x: -5, y: 2 });
  Coord public endCoord = Coord({ x: 0, y: 1 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    buildSystem = BuildSystem(system(BuildSystemID));
    buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    pathComponent = PathComponent(component(PathComponentID));
    tileComponent = TileComponent(component(TileComponentID));
    vm.stopPrank();
  }

  function testFailBuildPathFromMainBaseToMine() public {
    vm.startPrank(alice);

    assertEq(LibTerrain.getTopLayerKey(startCoord), IronID, "test should try to build IronMineID on IronID tile");

    assertTrue(tileComponent.has(DebugIronMineID), "IronMineID building should have tile type");
    assertEq(
      tileComponent.getValue(DebugIronMineID),
      IronID,
      "IronMineID should have IronID as requireed tile type to build on"
    );
    // Build two conveyor blocks
    bytes memory startBlockEntity = buildSystem.executeTyped(MainBaseID, endCoord);
    console.log("built MainBaseID");
    bytes memory endBlockEntity = buildSystem.executeTyped(DebugIronMineID, startCoord);
    console.log("built IronMineID");

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
    console.log("built path");
    assertEq(
      pathComponent.getValue(startBlockEntityID),
      endBlockEntityID,
      "startBlockEntityID should have path to endBlockEntityID"
    );

    vm.stopPrank();
  }

  function testInit() public {
    vm.startPrank(alice);

    assertEq(LibTerrain.getTopLayerKey(startCoord), IronID, "test should try to build IronMineID on IronID tile");

    assertTrue(tileComponent.has(DebugIronMineID), "IronMineID building should have tile type");
    assertEq(
      tileComponent.getValue(DebugIronMineID),
      IronID,
      "IronMineID should have IronID as requireed tile type to build on"
    );
  }

  function testBuildConveyors() public returns (uint256 startBlockEntityID, uint256 endBlockEntityID) {
    testInit();
    // Build two conveyor blocks

    console.log("building base");
    bytes memory endBlockEntity = buildSystem.executeTyped(MainBaseID, endCoord);
    console.log("building iron mine");
    bytes memory startBlockEntity = buildSystem.executeTyped(DebugIronMineID, startCoord);

    startBlockEntityID = abi.decode(startBlockEntity, (uint256));
    endBlockEntityID = abi.decode(endBlockEntity, (uint256));

    Coord memory startPosition = LibEncode.decodeCoordEntity(startBlockEntityID);
    assertCoordEq(startPosition, startCoord);

    Coord memory endPosition = LibEncode.decodeCoordEntity(endBlockEntityID);
    assertCoordEq(endPosition, endCoord);

    assertTrue(ownedByComponent.has(startBlockEntityID));
    assertEq(ownedByComponent.getValue(startBlockEntityID), addressToEntity(alice));

    assertTrue(ownedByComponent.has(endBlockEntityID));
    assertEq(ownedByComponent.getValue(endBlockEntityID), addressToEntity(alice));
  }

  function testBuildPath() public {
    (uint256 startBlockEntityID, uint256 endBlockEntityID) = testBuildConveyors();
    // Build a path
    buildPathSystem.executeTyped(startCoord, endCoord);
    console.log("built path");
    assertEq(
      pathComponent.getValue(startBlockEntityID),
      endBlockEntityID,
      "startBlockEntityID should have path to endBlockEntityID"
    );
  }
}
