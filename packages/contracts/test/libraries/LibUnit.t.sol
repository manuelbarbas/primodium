// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

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
  bytes32 rock = "rock";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(worldAddress);
    BuildingType.set(building, buildingPrototype);
    BuildingType.set(building2, buildingPrototype);
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
    assertFalse(LibUnit.canProduceUnit(building, 0, bytes32(0)));
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

  function testincreaseUnitCount() public {
    UnitCount.set(player, Home.getAsteroid(player), unit, 50);
    P_GameConfig.setUnitProductionRate(100);
    QueueItemUnitsData memory item = QueueItemUnitsData(unit, 100);
    UnitProductionQueue.enqueue(building, item);
    LibUnit.increaseUnitCount(player, Home.getAsteroid(player), unit, 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unit), 150);
  }

  function testUpdateStoredUtilitiesAdd() public {
    MaxResourceCount.set(player, Iron, 100);
    P_IsUtility.set(Iron, true);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, true);
    assertEq(ResourceCount.get(player, Iron), 100);
  }

  function testUpdateStoredUtilitiesNotUtility() public {
    MaxResourceCount.set(player, Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, true);
    assertEq(ResourceCount.get(player, Iron), 0);
  }

  function testFailUpdateStoredUtilitiesNoSpace() public {
    P_IsUtility.set(Iron, true);
    MaxResourceCount.set(player, Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 3, true);
  }

  function testUpdateStoredUtilitiesSubtract() public {
    P_IsUtility.set(Iron, true);
    MaxResourceCount.set(player, Iron, 100);
    ResourceCount.set(player, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 2, false);
    assertEq(ResourceCount.get(player, Iron), 34);
  }

  function testUpdateStoredUtilitiesSubtractOverflow() public {
    P_IsUtility.set(Iron, true);
    MaxResourceCount.set(player, Iron, 100);
    ResourceCount.set(player, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 0, requiredResourcesData);

    LibUnit.updateStoredUtilities(player, unit, 10, false);
    assertEq(ResourceCount.get(player, Iron), 0);
  }

  function testDecreaseUnitCount() public {
    UnitCount.set(player, rock, unit, 100);
    LibUnit.decreaseUnitCount(player, rock, unit, 50);
    assertEq(UnitCount.get(player, rock, unit), 50);

    LibUnit.decreaseUnitCount(player, rock, unit, 100);
    assertEq(UnitCount.get(player, rock, unit), 0);
  }
}
