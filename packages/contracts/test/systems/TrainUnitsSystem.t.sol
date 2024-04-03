// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest, toString } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit } from "src/Types.sol";
import { UnitKey, AsteroidOwnedByKey } from "src/Keys.sol";

import { P_ColonyShipConfig, UnitCount, MaxResourceCount, ProductionRate, Value_UnitProductionQueueData, P_UnitProdTypes, BuildingType, IsActive, P_EnumToPrototype, P_GameConfigData, P_GameConfig, Asteroid, Home, OwnedBy, Spawned, Level, LastClaimedAt, P_Unit, P_UnitProdMultiplier, P_EnumToPrototype, ResourceCount, ResourceCount, P_UnitPrototypes, P_RequiredResources, P_RequiredResourcesData, ColonySlots } from "codegen/index.sol";

import { UnitProductionQueue } from "libraries/UnitProductionQueue.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { AsteroidSet } from "libraries/AsteroidSet.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibColony } from "libraries/LibColony.sol";

contract TrainUnitsSystemTest is PrimodiumTest {
  bytes32 asteroidEntity = bytes32("asteroidEntity");
  bytes32 playerEntity;
  bytes32 aliceEntity;
  bytes32 aliceAsteroidEntity;
  bytes32 shipyard;

  EUnit unit = EUnit(1);
  bytes32 unitPrototype = "unitPrototype";

  bytes32 buildingEntity = "buildingEntity";
  bytes32 buildingPrototype = "buildingPrototype";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    aliceEntity = addressToEntity(alice);
    BuildingType.set(buildingEntity, buildingPrototype);
    IsActive.set(buildingEntity, true);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);
    P_GameConfigData memory config = P_GameConfig.get();
    config.unitProductionRate = 100;
    P_GameConfig.set(config);
    Asteroid.setIsAsteroid(asteroidEntity, true);
    Home.set(playerEntity, asteroidEntity);
    OwnedBy.set(buildingEntity, asteroidEntity);
    Spawned.set(playerEntity, true);

    switchPrank(alice);
    aliceAsteroidEntity = world.Primodium__spawn();
    switchPrank(creator);
  }

  // copied from LibUnit.t.sol
  function setupClaimUnits() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp - 100);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);

    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    UnitFactorySet.add(asteroidEntity, buildingEntity);
  }

  function testCannotProduceUnit() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Building cannot produce unit"));
    world.Primodium__trainUnits(buildingEntity, unit, 1);
  }

  function testTrainUnits() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 0, unitPrototypes);

    world.Primodium__trainUnits(buildingEntity, unit, 1);
    Value_UnitProductionQueueData memory data = UnitProductionQueue.peek(buildingEntity);
    assertEq(toString(data.unitEntity), toString(unitPrototype));
    assertEq(data.quantity, 1);
  }

  function testTrainUnitsNotEnoughResources() public {
    uint8[] memory p_requiredresources_resources_level_0 = new uint8[](1);
    p_requiredresources_resources_level_0[0] = uint8(Iron);
    uint256[] memory p_requiredresources_amounts_level_0 = new uint256[](1);
    p_requiredresources_amounts_level_0[0] = 100;

    P_RequiredResources.set(
      unitPrototype,
      0,
      P_RequiredResourcesData(p_requiredresources_resources_level_0, p_requiredresources_amounts_level_0)
    );
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 0, unitPrototypes);

    vm.expectRevert(bytes("[SpendResources] Not enough resources to spend"));
    world.Primodium__trainUnits(buildingEntity, unit, 1);
  }

  function testTrainUnitsUpdateAsteroid() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 1, unitPrototypes);

    Asteroid.setIsAsteroid(asteroidEntity, true);

    setupClaimUnits();
    Home.set(playerEntity, asteroidEntity);
    OwnedBy.set(asteroidEntity, playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ProductionRate.set(asteroidEntity, Iron, 10);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);

    world.Primodium__trainUnits(buildingEntity, unit, 1);
    LibUnit.claimUnits(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 100, "resource count");
    assertEq(UnitCount.get(asteroidEntity, unitPrototype), 100, "unit count");
  }

  function testTrainColonyShip() public {
    LibColony.increaseColonySlotsCapacity(aliceEntity);

    uint256 multiplier = LibUnit.getColonyShipCostMultiplier(aliceEntity);
    assertEq(multiplier, 1);
    uint256 amount = P_ColonyShipConfig.getInitialCost() * multiplier;
    assertEq(
      amount,
      P_ColonyShipConfig.getInitialCost() * LibUnit.getColonyShipCostMultiplier(aliceEntity),
      "next colony ship cost"
    );
    uint8 resource = P_ColonyShipConfig.getResource();
    trainUnits(alice, EUnit.ColonyShip, 1, true);
    assertEq(ResourceCount.get(aliceAsteroidEntity, uint8(resource)), 0, "special resource should have been spent");
  }

  function testFailTrainColonyShipNoSpecialResource() public {
    vm.stopPrank();
    increaseResource(aliceAsteroidEntity, EResource.U_ColonyShipCapacity, 1);
    //this func doesn't provide resources
    trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip)), 1, true);
  }

  function testInvalidBuilding() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Can not train units using an in active building"));
    world.Primodium__trainUnits(bytes32(0), unit, 1);
  }

  function testInvalidUnit() public {
    vm.expectRevert();
    world.Primodium__trainUnits(buildingEntity, EUnit(uint8(100)), 1);
  }
}
