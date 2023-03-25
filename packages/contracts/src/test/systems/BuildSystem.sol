// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../../components/PositionComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { LithiumMinerID, ConveyerID } from "../../prototypes/Tiles.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuild() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));

    bytes memory blockEntity = buildSystem.executeTyped(LithiumMinerID, coord);

    uint256 blockEntityID = abi.decode(blockEntity, (uint256));

    Coord memory position = positionComponent.getValue(blockEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(blockEntityID));
    assertEq(ownedByComponent.getValue(blockEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    buildSystem.executeTyped(LithiumMinerID, coord);
    buildSystem.executeTyped(LithiumMinerID, coord);

    vm.stopPrank();
  }

  function testBuildPath() public {
    vm.startPrank(alice);

    Coord memory startCoord = Coord({ x: 0, y: 0 });
    Coord memory endCoord = Coord({ x: 0, y: 1 });

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    PathComponent pathComponent = PathComponent(component(PathComponentID));

    // Build two conveyer blocks
    bytes memory startBlockEntity = buildSystem.executeTyped(ConveyerID, startCoord);
    bytes memory endBlockEntity = buildSystem.executeTyped(ConveyerID, endCoord);

    uint256 startBlockEntityID = abi.decode(startBlockEntity, (uint256));
    uint256 endBlockEntityID = abi.decode(endBlockEntity, (uint256));

    Coord memory startPosition = positionComponent.getValue(startBlockEntityID);
    assertEq(startPosition.x, startCoord.x);
    assertEq(startPosition.y, startCoord.y);

    Coord memory endPosition = positionComponent.getValue(endBlockEntityID);
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
