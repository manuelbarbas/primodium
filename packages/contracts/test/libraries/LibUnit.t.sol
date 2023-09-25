// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract LibUnitTest is PrimodiumTest {
  bytes32 player;

  bytes32 unit = "unit";
  bytes32 unitPrototype = "unitPrototype";

  bytes32 unit2 = "unit2";
  bytes32 unitPrototype2 = "unitPrototype2";

  bytes32 building = "building";
  bytes32 buildingPrototype = "buildingPrototype";

  bytes32 building2 = "building2";

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
    BuildingType.set(building, buildingPrototype);
    BuildingType.set(building2, buildingPrototype);
    P_GameConfigData memory config = P_GameConfig.get();
    config.unitProductionRate = 100;
    P_GameConfig.set(config);
  }

  function testCanProduceUnit() public {
    P_UnitProduction.set(buildingPrototype, unitPrototype, true);
    assertTrue(LibUnit.canProduceUnit(building, unitPrototype));
  }

  function testCanProduceUnitInvalidBuilding() public {
    assertFalse(LibUnit.canProduceUnit(bytes32(0), unitPrototype));
  }

  function testCanProduceUnitInvalidUnit() public {
    assertFalse(LibUnit.canProduceUnit(building, bytes32(0)));
  }

  function testClaimUnits() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp);
    P_UnitProdMultiplier.set(building, 1, 100);

    Level.set(building2, 1);
    LastClaimedAt.set(building2, block.timestamp);
    P_UnitProdMultiplier.set(building2, 1, 100);

    UnitFactorySet.add(player, building);
    UnitFactorySet.add(player, building2);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    UnitProductionQueue.enqueue(building2, item);

    vm.warp(block.timestamp + 100);
    LibUnit.claimUnits(player);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 200);
  }

  function testClaimBuildingUnitsSingleAll() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp);
    P_UnitProdMultiplier.set(building, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    vm.warp(block.timestamp + 100);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 100);
    assertTrue(UnitProductionQueue.isEmpty(building));
  }

  function testClaimBuildingUnitsSinglePart() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp);
    P_UnitProdMultiplier.set(building, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 25);
    assertEq(UnitProductionQueue.peek(building).quantity, 75);
    assertFalse(UnitProductionQueue.isEmpty(building));
  }

  function testClaimBuildingUnitsDouble() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp);
    P_UnitProdMultiplier.set(building, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);

    P_Unit.setTrainingTime(unitPrototype2, 0, 1);
    QueueItemUnitsData memory item2 = QueueItemUnitsData(unitPrototype2, 100);
    UnitProductionQueue.enqueue(building, item2);

    vm.warp(block.timestamp + 1000);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype2), 100);
    assertTrue(UnitProductionQueue.isEmpty(building));
  }

  function testClaimBuildingUnitsDoublePart() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp);
    P_UnitProdMultiplier.set(building, 1, 100);

    P_Unit.setTrainingTime(unitPrototype, 0, 1);
    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);

    P_Unit.setTrainingTime(unitPrototype2, 0, 1);
    QueueItemUnitsData memory item2 = QueueItemUnitsData(unitPrototype2, 100);
    UnitProductionQueue.enqueue(building, item2);

    vm.warp(block.timestamp + 25);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 25);
    assertEq(UnitProductionQueue.peek(building).quantity, 75);
    assertFalse(UnitProductionQueue.isEmpty(building));

    vm.warp(block.timestamp + 76);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype2), 1);
    assertEq(toString(UnitProductionQueue.peek(building).unitId), toString(unitPrototype2));
    assertEq(UnitProductionQueue.peek(building).quantity, 99);
    assertFalse(UnitProductionQueue.isEmpty(building));

    vm.warp(block.timestamp + 100);
    LibUnit.claimBuildingUnits(player, building);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype2), 100);
    assertTrue(UnitProductionQueue.isEmpty(building));
  }

  function testGetUnitBuildTime() public {
    P_UnitProdMultiplier.set(building, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 100);
    Level.set(building, 1);
    assertEq(LibUnit.getUnitBuildTime(player, building, unitPrototype), 100);

    P_UnitProdMultiplier.set(building, 1, 50);
    P_Unit.setTrainingTime(unitPrototype, 0, 100);
    Level.set(building, 1);
    assertEq(LibUnit.getUnitBuildTime(player, building, unitPrototype), 200);

    P_UnitProdMultiplier.set(building, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 200);
    Level.set(building, 1);
    assertEq(LibUnit.getUnitBuildTime(player, building, unitPrototype), 200);
  }

  function testAddUnitsToAsteroid() public {
    UnitCount.set(player, Home.getAsteroid(player), unit, 50);
    P_GameConfig.setUnitProductionRate(100);
    QueueItemUnitsData memory item = QueueItemUnitsData(unit, 100);
    UnitProductionQueue.enqueue(building, item);
    LibUnit.addUnitsToAsteroid(player, Home.getAsteroid(player), unit, 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unit), 150);
  }

  function testUpdateStoredUtilitiesAdd() public {
    P_IsUtility.set(EResource.Iron, true);
    MaxResourceCount.set(player, EResource.Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, true);
    assertEq(ResourceCount.get(player, EResource.Iron), 100);
  }

  function testUpdateStoredUtilitiesNotUtility() public {
    MaxResourceCount.set(player, EResource.Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, true);
    assertEq(ResourceCount.get(player, EResource.Iron), 0);
  }

  function testFailUpdateStoredUtilitiesNoSpace() public {
    P_IsUtility.set(EResource.Iron, true);
    MaxResourceCount.set(player, EResource.Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 3, true);
  }

  function testUpdateStoredUtilitiesSubtract() public {
    P_IsUtility.set(EResource.Iron, true);
    MaxResourceCount.set(player, EResource.Iron, 100);
    ResourceCount.set(player, EResource.Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, false);
    assertEq(ResourceCount.get(player, EResource.Iron), 34);
  }

  function testUpdateStoredUtilitiesSubtractOverflow() public {
    P_IsUtility.set(EResource.Iron, true);
    MaxResourceCount.set(player, EResource.Iron, 100);
    ResourceCount.set(player, EResource.Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 10, false);
    assertEq(ResourceCount.get(player, EResource.Iron), 0);
  }
}
