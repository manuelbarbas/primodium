pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { DebugAquireResourcesSystem, ID as DebugAquireResourcesSystemID } from "../../systems/DebugAquireResourcesSystem.sol";

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
import { DebugIronMineID } from "../../libraries/LibDebugInitializer.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";

contract BuildPathSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testFailBuildPathFromMainBaseToMine() public {
    vm.startPrank(alice);

    Coord memory startCoord = Coord({ x: 0, y: 1 });
    Coord memory endCoord = Coord({ x: -5, y: 2 });

    assertEq(LibTerrain.getTopLayerKey(startCoord), IronID, "test should try to build IronMineID on IronID tile");
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    PathComponent pathComponent = PathComponent(component(PathComponentID));
    TileComponent tileComponent = TileComponent(component(TileComponentID));

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

  function testBuildPath() public {
    vm.startPrank(alice);

    Coord memory startCoord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(startCoord), IronID, "test should try to build IronMineID on IronID tile");
    Coord memory endCoord = Coord({ x: 0, y: 1 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    PathComponent pathComponent = PathComponent(component(PathComponentID));
    TileComponent tileComponent = TileComponent(component(TileComponentID));

    assertTrue(tileComponent.has(DebugIronMineID), "IronMineID building should have tile type");
    assertEq(
      tileComponent.getValue(DebugIronMineID),
      IronID,
      "IronMineID should have IronID as requireed tile type to build on"
    );
    // Build two conveyor blocks
    bytes memory endBlockEntity = buildSystem.executeTyped(MainBaseID, endCoord);
    console.log("built MainBaseID");
    bytes memory startBlockEntity = buildSystem.executeTyped(DebugIronMineID, startCoord);
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
}
