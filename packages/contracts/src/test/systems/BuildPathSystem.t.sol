// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "../../components/P_RequiredTileComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
//debug buildings
import "../../prototypes.sol";

//main buildings
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
  P_RequiredTileComponent public requiredTileComponent;

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    buildSystem = BuildSystem(system(BuildSystemID));
    buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    pathComponent = PathComponent(component(PathComponentID));
    requiredTileComponent = P_RequiredTileComponent(component(P_RequiredTileComponentID));
    vm.stopPrank();
  }

  function testFailBuildPathFromMainBaseToMine() public {
    vm.startPrank(alice);

    assertEq(
      LibTerrain.getTopLayerKey(getIronCoord(alice)),
      IronID,
      "test should try to build IronMineID on IronID tile"
    );

    assertTrue(requiredTileComponent.has(DebugIronMineID), "IronMineID building should have tile type");
    assertEq(
      requiredTileComponent.getValue(DebugIronMineID),
      IronID,
      "IronMineID should have IronID as requireed tile type to build on"
    );
    // Build two conveyor blocks
    bytes memory startBlockEntity = buildSystem.executeTyped(MainBaseID, getCoord1(alice));
    console.log("built MainBaseID");
    bytes memory endBlockEntity = buildSystem.executeTyped(DebugIronMineID, getIronCoord(alice));
    console.log("built IronMineID");

    uint256 startBlockEntityID = abi.decode(startBlockEntity, (uint256));
    uint256 endBlockEntityID = abi.decode(endBlockEntity, (uint256));
    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    Coord memory startPosition = positionComponent.getValue(startBlockEntityID);
    assertCoordEq(startPosition, getIronCoord(alice));

    Coord memory endPosition = positionComponent.getValue(endBlockEntityID);
    assertCoordEq(endPosition, getCoord1(alice));

    assertTrue(ownedByComponent.has(startBlockEntityID));
    assertEq(ownedByComponent.getValue(startBlockEntityID), addressToEntity(alice));

    assertTrue(ownedByComponent.has(endBlockEntityID));
    assertEq(ownedByComponent.getValue(endBlockEntityID), addressToEntity(alice));

    // Build a path
    buildPathSystem.executeTyped(getIronCoord(alice), getCoord1(alice));
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

    assertEq(
      LibTerrain.getTopLayerKey(getIronCoord(alice)),
      IronID,
      "test should try to build IronMineID on IronID tile"
    );

    assertTrue(requiredTileComponent.has(DebugIronMineID), "IronMineID building should have tile type");
    assertEq(
      requiredTileComponent.getValue(DebugIronMineID),
      IronID,
      "IronMineID should have IronID as requireed tile type to build on"
    );
  }

  function testBuildConveyors() public returns (uint256 startBlockEntityID, uint256 endBlockEntityID) {
    testInit();
    // Build two conveyor blocks

    console.log("building base");
    bytes memory endBlockEntity = buildSystem.executeTyped(MainBaseID, getCoord1(alice));
    console.log("building iron mine");
    bytes memory startBlockEntity = buildSystem.executeTyped(DebugIronMineID, getIronCoord(alice));

    startBlockEntityID = abi.decode(startBlockEntity, (uint256));
    endBlockEntityID = abi.decode(endBlockEntity, (uint256));

    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    Coord memory startPosition = positionComponent.getValue(startBlockEntityID);
    assertCoordEq(startPosition, getIronCoord(alice));

    Coord memory endPosition = positionComponent.getValue(endBlockEntityID);
    assertCoordEq(endPosition, getCoord1(alice));

    assertTrue(ownedByComponent.has(startBlockEntityID));
    assertEq(ownedByComponent.getValue(startBlockEntityID), addressToEntity(alice));

    assertTrue(ownedByComponent.has(endBlockEntityID));
    assertEq(ownedByComponent.getValue(endBlockEntityID), addressToEntity(alice));
  }

  function testBuildPath() public {
    (uint256 startBlockEntityID, uint256 endBlockEntityID) = testBuildConveyors();
    // Build a path
    buildPathSystem.executeTyped(getIronCoord(alice), getCoord1(alice));
    console.log("built path");
    assertEq(
      pathComponent.getValue(startBlockEntityID),
      endBlockEntityID,
      "startBlockEntityID should have path to endBlockEntityID"
    );
  }
}
