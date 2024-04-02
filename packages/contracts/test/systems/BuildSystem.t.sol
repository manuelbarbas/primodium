// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EBuilding, EResource } from "src/Types.sol";
import { BuildingKey, ExpansionKey } from "src/Keys.sol";
import { IronMinePrototypeId } from "codegen/Prototypes.sol";

import { Dimensions, P_RequiredResourcesData, P_ByLevelMaxResourceUpgrades, P_RequiredBaseLevel, P_EnumToPrototype, Position, PositionData, TilePositions, Level, P_Blueprint, Home, P_RequiredResources, ResourceCount, ProductionRate, ConsumptionRate, P_RequiredDependencyData, P_Production, P_ProductionData, P_RequiredDependency, P_ListMaxResourceUpgrades, MaxResourceCount } from "codegen/index.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";

import { WorldResourceIdInstance, WorldResourceIdLib, ResourceId } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

contract BuildSystemTest is PrimodiumTest {
  using WorldResourceIdInstance for ResourceId;
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testShipyardBuild() public {
    EBuilding building = EBuilding.Shipyard;
    Dimensions.set(ExpansionKey, 1, 35, 27);
    P_RequiredResourcesData memory requiredResources = getBuildCost(building);
    provideResources(Home.get(playerEntity), requiredResources);
    vm.startPrank(creator);
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Shipyard)), 1, 0);

    PositionData memory originalPosition = getTilePosition(Home.get(playerEntity), building);
    uint256 gas = gasleft();
    world.Primodium__build(building, originalPosition);
    console.log("after", gas - gasleft());
  }

  function testBuildLargeBuilding() public {
    address namespaceOwner = NamespaceOwner.get(WorldResourceIdLib.encodeNamespace(bytes14("Primodium")));
    console.log("namespace owner:", namespaceOwner);
    address creator = world.creator();
    console.log("creator:", creator);

    Level.set(Home.get(playerEntity), 2);
    int32[] memory blueprint = get2x2Blueprint();
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = IronMinePrototypeId;

    P_Blueprint.set(IronMinePrototypeId, blueprint);

    bytes32 buildingEntity = world.Primodium__build(
      EBuilding.IronMine,
      getTilePosition(Home.get(playerEntity), EBuilding.IronMine)
    );

    PositionData memory buildingPosition = Position.get(buildingEntity);
    logPosition(buildingPosition);
    int32[] memory tilePositions = TilePositions.get(buildingEntity);
    assertEq(blueprint.length, tilePositions.length);

    for (uint256 i = 0; i < tilePositions.length; i += 2) {
      assertEq(tilePositions[i], blueprint[i] + buildingPosition.x);
      assertEq(tilePositions[i + 1], blueprint[i + 1] + buildingPosition.y);

      int32[] memory currPosition = new int32[](2);
      currPosition[0] = tilePositions[i];
      currPosition[1] = tilePositions[i + 1];
      assertFalse(LibAsteroid.allTilesAvailable(Home.get(playerEntity), currPosition));
    }
  }

  function testInvalidIndexFail() public {
    PositionData memory ironPositionData = getTilePosition(Home.get(playerEntity), EBuilding.IronMine);

    vm.expectRevert(bytes("[BuildSystem] Invalid building type"));
    world.Primodium__build(EBuilding.LENGTH, ironPositionData);
  }

  function testFailIronMineOnNonIron() public {
    PositionData memory ironPositionData = getTilePosition(Home.get(playerEntity), EBuilding.IronPlateFactory);

    world.Primodium__build(EBuilding.IronMine, ironPositionData);
  }

  function testSameXYCanCollide() public {
    PositionData memory ironPositionData = getTilePosition(Home.get(playerEntity), EBuilding.IronMine);
    world.Primodium__build(EBuilding.IronMine, ironPositionData);
    vm.stopPrank();

    vm.startPrank(bob);
    ironPositionData.parentEntity = Home.get(addressToEntity(bob));
    world.Primodium__build(EBuilding.IronMine, ironPositionData);
  }

  function testSameXYZCannotCollideFail() public {
    PositionData memory ironPositionData = getTilePosition(Home.get(playerEntity), EBuilding.IronMine);
    removeRequirements(EBuilding.IronMine);
    world.Primodium__build(EBuilding.IronMine, ironPositionData);

    vm.expectRevert(bytes("[BuildSystem] Tile unavailable"));
    world.Primodium__build(EBuilding.IronMine, ironPositionData);
  }

  function testBuiltOnWrongAsteroid() public {
    PositionData memory coord = getTilePosition(Home.get(addressToEntity(bob)), EBuilding.IronMine);

    vm.expectRevert(bytes("[BuildSystem] You can only build on an asteroid you control"));
    world.Primodium__build(EBuilding.IronMine, coord);
  }

  function testBuildTwiceMainBaseFail() public {
    PositionData memory coord = getTilePosition(Home.get(playerEntity), EBuilding.MainBase);
    vm.expectRevert(bytes("[BuildSystem] Cannot build more than one main base per asteroid"));
    world.Primodium__build(EBuilding.MainBase, coord);
  }

  function testBuildMainBaseLevelNotMetFail() public {
    EBuilding building = EBuilding.AlloyFactory;
    P_RequiredResourcesData memory requiredResources = getBuildCost(building);
    provideResources(Home.get(playerEntity), requiredResources);

    PositionData memory position = getTilePosition(Home.get(playerEntity), building);
    vm.expectRevert(bytes("[BuildSystem] MainBase level requirement not met"));
    vm.prank(creator);
    world.Primodium__build(building, position);
  }

  function testBuildMainBaseLevelMet() public {
    PositionData memory coord = getTilePosition(Home.get(playerEntity), EBuilding.IronMine);

    P_RequiredBaseLevel.set(IronMinePrototypeId, 0, 2);
    removeRequirements(EBuilding.IronMine);
    world.Primodium__build(EBuilding.IronMine, coord);
  }

  function testIronMineOnNonIronFail() public {
    PositionData memory nonIronCoord = getTilePosition(Home.get(playerEntity), EBuilding.IronPlateFactory);

    vm.expectRevert(bytes("[BuildSystem] Cannot build on this tile"));
    world.Primodium__build(EBuilding.IronMine, nonIronCoord);
  }

  function testBuildWithResourceReqs() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    world.Primodium__build(EBuilding.IronMine, getTilePosition(asteroidEntity, EBuilding.IronMine));
    bytes32 ironMinePrototype = P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine));
    assertGe(
      P_RequiredResources.lengthResources(ironMinePrototype, 2),
      0,
      "Iron Mine Level 2 should have resource requirements"
    );
  }

  function testBuildWithRequiredResources() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);

    world.Primodium__build(EBuilding.IronMine, getTilePosition(asteroidEntity, EBuilding.IronMine));

    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
  }

  function testBuildWithProductionDependencies() public {
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    bytes32 asteroidEntity = Home.get(playerEntity);
    ProductionRate.set(asteroidEntity, Iron, originalProduction);
    ConsumptionRate.set(asteroidEntity, Iron, 0);
    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(
      uint8(Iron),
      productionReduction
    );

    P_RequiredDependency.set(IronMinePrototypeId, 1, requiredDependenciesData);

    world.Primodium__build(EBuilding.IronMine, getTilePosition(asteroidEntity, EBuilding.IronMine));
    uint256 productionIncrease = P_Production.getAmounts(IronMinePrototypeId, 1)[0];
    assertEq(ProductionRate.get(asteroidEntity, Iron), originalProduction + productionIncrease);
    assertEq(ConsumptionRate.get(asteroidEntity, Iron), productionReduction);
  }

  function testBuildWithResourceProductionIncrease() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    uint256 increase = 69;
    P_ProductionData memory data1 = P_ProductionData(new uint8[](1), new uint256[](1));
    data1.resources[0] = uint8(EResource.Iron);
    data1.amounts[0] = increase;
    P_Production.set(IronMinePrototypeId, 1, data1);

    world.Primodium__build(EBuilding.IronMine, getTilePosition(asteroidEntity, EBuilding.IronMine));
    assertEq(ProductionRate.get(asteroidEntity, Iron), increase);
  }

  function testBuildWithMaxStorageIncrease() public {
    uint8[] memory data = new uint8[](1);
    data[0] = uint8(Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 1, 50);
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 0);
    world.Primodium__build(EBuilding.IronMine, getTilePosition(asteroidEntity, EBuilding.IronMine));
    assertEq(MaxResourceCount.get(asteroidEntity, Iron), 50);
  }
}
