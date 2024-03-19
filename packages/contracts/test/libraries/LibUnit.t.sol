// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest, toString } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource } from "src/types.sol";

import { P_IsUtility, ClaimOffset, Position, PositionData, UnitCount, MaxResourceCount, Value_UnitProductionQueueData, P_UnitProdTypes, BuildingType, P_GameConfigData, P_GameConfig, Asteroid, Home, OwnedBy, Level, LastClaimedAt, P_Unit, P_UnitProdMultiplier, ResourceCount, ResourceCount, P_RequiredResources, P_RequiredResourcesData } from "codegen/index.sol";

import { UnitProductionQueue } from "libraries/UnitProductionQueue.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";

contract LibUnitTest is PrimodiumTest {
  bytes32 playerEntity;

  bytes32 unitEntity = "unit";
  bytes32 unitPrototype = "unitPrototype";

  bytes32 unitPrototype2 = "unitPrototype2";

  bytes32 buildingEntity = "building";
  bytes32 buildingPrototype = "buildingPrototype";

  bytes32 building2Entity = "building2";
  bytes32 asteroidEntity = "asteroidEntity";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    world.Primodium__spawn();

    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(Home.get(playerEntity), playerEntity);
    OwnedBy.set(buildingEntity, Home.get(playerEntity));
    OwnedBy.set(building2Entity, Home.get(playerEntity));
    BuildingType.set(building2Entity, buildingPrototype);
    P_GameConfigData memory config = P_GameConfig.get();
    config.unitProductionRate = 100;
    P_GameConfig.set(config);
  }

  function testCanProduceUnit() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 0, unitPrototypes);
    assertTrue(LibUnit.canProduceUnit(buildingPrototype, 0, unitPrototype));
  }

  function testCanProduceUnitInvalidBuilding() public {
    assertFalse(LibUnit.canProduceUnit(bytes32(0), 0, unitPrototype));
  }

  function testCanProduceUnitInvalidUnit() public {
    assertFalse(LibUnit.canProduceUnit(buildingEntity, 0, bytes32(0)));
  }

  function testClaimUnits() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    Level.set(building2Entity, 1);
    LastClaimedAt.set(building2Entity, block.timestamp);

    UnitFactorySet.add(Home.get(playerEntity), buildingEntity);
    UnitFactorySet.add(Home.get(playerEntity), building2Entity);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    UnitProductionQueue.enqueue(building2Entity, item);

    bytes32[] memory buildings = UnitFactorySet.getAll(Home.get(playerEntity));

    vm.warp(block.timestamp + 100);
    LibUnit.claimUnits(Home.get(playerEntity));
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 200);
  }

  function testClaimUnitsConqueredAsteroid() public {
    P_GameConfig.setAsteroidChanceInv(1);
    PositionData memory position = Position.get(Home.get(playerEntity));

    bytes32 secondaryAsteroid = LibAsteroid.createSecondaryAsteroid(
      findSecondaryAsteroid(playerEntity, Home.get(playerEntity))
    );
    conquerAsteroid(creator, Home.get(playerEntity), secondaryAsteroid);
    vm.startPrank(creator);
    console.log("here:");
    OwnedBy.set(buildingEntity, secondaryAsteroid);
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    UnitFactorySet.add(secondaryAsteroid, buildingEntity);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    UnitProductionQueue.enqueue(building2Entity, item);

    bytes32[] memory buildings = UnitFactorySet.getAll(secondaryAsteroid);
    console.log("buildings", buildings.length);
    for (uint256 i = 0; i < buildings.length; i++) {
      bytes32 buildingEntity = buildings[i];
      bytes32 asteroidEntity = OwnedBy.get(buildingEntity);
      console.log("building owner: %x", uint256(asteroidEntity));
      console.log("is asteroid:", Asteroid.getIsAsteroid(asteroidEntity));
    }
    vm.warp(block.timestamp + 100);
    LibUnit.claimUnits(secondaryAsteroid);
    assertEq(UnitCount.get(secondaryAsteroid, unitPrototype), 100);
  }

  function testClaimBuildingUnitsSingleAll() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    vm.warp(block.timestamp + 100);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 100);
    assertTrue(UnitProductionQueue.isEmpty(buildingEntity));
  }

  function testClaimBuildingUnitsSinglePart() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 25);
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 75);
    assertFalse(UnitProductionQueue.isEmpty(buildingEntity));
  }

  function testClaimBuildingUnitsDouble() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);

    P_Unit.setTrainingTime(unitPrototype2, 0, 1);
    Value_UnitProductionQueueData memory item2 = Value_UnitProductionQueueData(unitPrototype2, 100);
    UnitProductionQueue.enqueue(buildingEntity, item2);

    vm.warp(block.timestamp + 1000);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 100, "unit count does not match");
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype2), 100, "unit 2 count does not match");
    assertTrue(UnitProductionQueue.isEmpty(buildingEntity), "queue should be empty");
  }

  function testClaimBuildingUnitsDoublePart() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);

    P_Unit.setTrainingTime(unitPrototype2, 0, 1);
    Value_UnitProductionQueueData memory item2 = Value_UnitProductionQueueData(unitPrototype2, 100);
    UnitProductionQueue.enqueue(buildingEntity, item2);

    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 25);
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 75);
    assertFalse(UnitProductionQueue.isEmpty(buildingEntity));

    vm.warp(block.timestamp + 76);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 100);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype2), 1);
    assertEq(toString(UnitProductionQueue.peek(buildingEntity).unitId), toString(unitPrototype2));
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 99);
    assertFalse(UnitProductionQueue.isEmpty(buildingEntity));

    vm.warp(block.timestamp + 100);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 100);
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype2), 100);
    assertTrue(UnitProductionQueue.isEmpty(buildingEntity));
  }

  function testClaimUnitsOffset() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 100);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);

    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 25, "offset 1 should be 25");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 100, "queue should have 100 units");

    vm.warp(block.timestamp + 50);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 75, "offset 2 should be 75");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 100, "queue should have 100 units");

    vm.warp(block.timestamp + 50);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 25, "offset 3 should be 25");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 99, "queue should have 99 units");

    vm.warp(block.timestamp + 174);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 99, "offset 3 should be 25");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 98, "queue should have 98 units");
  }

  function testClaimUnitsClearOffset() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 10);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 10);
    UnitProductionQueue.enqueue(buildingEntity, item);

    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 5, "offset 1 should be 5");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 8, "queue should have 8 units");

    vm.warp(block.timestamp + 50);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 5, "offset 2 should be 5");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 3, "queue should have 3 units");

    vm.warp(block.timestamp + 135);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 0, "offset 3 should be 0");
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 10);
  }

  function testClaimMultipleUnitsClearOffset() public {
    Level.set(buildingEntity, 1);
    LastClaimedAt.set(buildingEntity, block.timestamp);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 10);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitPrototype, 10);
    UnitProductionQueue.enqueue(buildingEntity, item);
    UnitProductionQueue.enqueue(buildingEntity, item);

    vm.warp(block.timestamp + 125);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 5, "offset 1 should be 5");
    assertEq(UnitProductionQueue.peek(buildingEntity).quantity, 8, "queue should have 8 units");
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 12);

    vm.warp(block.timestamp + 135);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 0, "offset 2 should be 0");
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 20);

    UnitProductionQueue.enqueue(buildingEntity, item);
    UnitProductionQueue.enqueue(buildingEntity, item);

    vm.warp(block.timestamp + 203);
    LibUnit.claimBuildingUnits(buildingEntity);
    assertEq(ClaimOffset.get(buildingEntity), 0, "offset 2 should be 0");
    assertEq(UnitCount.get(Home.get(playerEntity), unitPrototype), 40);
    assertTrue(UnitProductionQueue.isEmpty(buildingEntity));
  }

  function testGetUnitBuildTime() public {
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 100);
    Level.set(buildingEntity, 1);
    assertEq(LibUnit.getUnitBuildTime(buildingEntity, unitPrototype), 100);

    P_UnitProdMultiplier.set(buildingPrototype, 1, 50);
    P_Unit.setTrainingTime(unitPrototype, 0, 100);
    Level.set(buildingEntity, 1);
    assertEq(LibUnit.getUnitBuildTime(buildingEntity, unitPrototype), 200);

    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 200);
    Level.set(buildingEntity, 1);
    assertEq(LibUnit.getUnitBuildTime(buildingEntity, unitPrototype), 200);
  }

  function testincreaseUnitCount() public {
    UnitCount.set(Home.get(playerEntity), unitEntity, 50);
    P_GameConfig.setUnitProductionRate(100);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unitEntity, 100);
    UnitProductionQueue.enqueue(buildingEntity, item);
    LibUnit.increaseUnitCount(Home.get(playerEntity), unitEntity, 100, false);
    assertEq(UnitCount.get(Home.get(playerEntity), unitEntity), 150);
  }

  function testUpdateStoredUtilitiesAdd() public {
    P_IsUtility.set(Iron, true);
    LibProduction.increaseResourceProduction(playerEntity, EResource(Iron), 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitEntity, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 2, true);
    assertEq(ResourceCount.get(playerEntity, Iron), 0);
  }

  function testUpdateStoredUtilitiesNotUtility() public {
    LibProduction.increaseResourceProduction(playerEntity, EResource(Iron), 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitEntity, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 2, true);
    assertEq(ResourceCount.get(playerEntity, Iron), 0);
  }

  function testFailUpdateStoredUtilitiesNoSpace() public {
    P_IsUtility.set(Iron, true);
    MaxResourceCount.set(playerEntity, Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitEntity, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 3, true);
  }

  function testUpdateStoredUtilitiesSubtract() public {
    P_IsUtility.set(Iron, true);

    LibProduction.increaseResourceProduction(playerEntity, EResource(Iron), 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unitEntity, 0, requiredResourcesData);
    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 3, true);
    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 2, false);
    assertEq(ResourceCount.get(playerEntity, Iron), 67);
  }

  function testFailUpdateStoredUtilitiesSubtractOverflow() public {
    P_IsUtility.set(Iron, true);
    LibProduction.increaseResourceProduction(playerEntity, EResource(Iron), 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unitEntity, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(playerEntity, unitEntity, 10, false);
  }

  function testDecreaseUnitCount() public {
    UnitCount.set(asteroidEntity, unitEntity, 100);
    LibUnit.decreaseUnitCount(asteroidEntity, unitEntity, 50, false);
    assertEq(UnitCount.get(asteroidEntity, unitEntity), 50);

    LibUnit.decreaseUnitCount(asteroidEntity, unitEntity, 50, false);
    assertEq(UnitCount.get(asteroidEntity, unitEntity), 0);
  }
}
