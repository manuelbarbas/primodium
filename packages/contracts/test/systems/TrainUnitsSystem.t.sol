// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract TrainUnitsSystemTest is PrimodiumTest {
  bytes32 rock = bytes32("rock");
  bytes32 player;
  bytes32 aliceEntity;

  EUnit unit = EUnit(1);
  bytes32 unitPrototype = "unitPrototype";

  bytes32 building = "building";
  bytes32 buildingPrototype = "buildingPrototype";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    aliceEntity = addressToEntity(alice);
    BuildingType.set(building, buildingPrototype);
    IsActive.set(building, true);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);
    P_GameConfigData memory config = P_GameConfig.get();
    config.unitProductionRate = 100;
    P_GameConfig.set(config);
    Asteroid.setIsAsteroid(rock, true);
    Home.set(player, rock);
    OwnedBy.set(building, rock);
    Spawned.set(player, true);
  }

  // copied from LibUnit.t.sol
  function setupClaimUnits() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp - 100);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);

    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    UnitFactorySet.add(rock, building);
  }

  function testCannotProduceUnit() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Building cannot produce unit"));
    world.trainUnits(building, unit, 1);
  }

  function testTrainUnits() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 0, unitPrototypes);

    world.trainUnits(building, unit, 1);
    QueueItemUnitsData memory data = UnitProductionQueue.peek(building);
    assertEq(toString(data.unitId), toString(unitPrototype));
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
    world.trainUnits(building, unit, 1);
  }

  function testTrainUnitsUpdateAsteroid() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 1, unitPrototypes);

    Asteroid.setIsAsteroid(rock, true);

    setupClaimUnits();
    Home.set(player, rock);
    OwnedBy.set(rock, player);
    MaxResourceCount.set(rock, Iron, 1000);
    ProductionRate.set(rock, Iron, 10);
    LastClaimedAt.set(rock, block.timestamp - 10);

    world.trainUnits(building, unit, 1);
    LibUnit.claimUnits(rock);
    assertEq(ResourceCount.get(rock, Iron), 100, "resource count does not match");
    assertEq(UnitCount.get(rock, unitPrototype), 100, "unit count does not match");
  }

  function testTrainCapitalShip() public {
    vm.startPrank(alice);
    bytes32 aliceHomeSpaceRock = world.spawn();
    vm.stopPrank();

    uint256 amount = P_CapitalShipConfig.getInitialCost();
    assertEq(LibUnit.getCapitalShipCostMultiplier(aliceEntity), 1);
    assertEq(
      amount,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship cost does not match expectation"
    );
    uint8 resource = P_CapitalShipConfig.getResource();
    trainUnits(alice, EUnit.CapitalShip, 1, true);
    assertEq(ResourceCount.get(aliceHomeSpaceRock, uint8(resource)), 0, "special resource should have been spent");
  }

  function testFailTrainCapitalShipNoSpecialResource() public {
    vm.startPrank(alice);
    bytes32 aliceHomeSpaceRock = world.spawn();
    vm.stopPrank();
    increaseResource(aliceHomeSpaceRock, EResource.U_CapitalShip, 1);
    //this func doesn't provide resources
    trainUnits(alice, Home.get(aliceHomeSpaceRock), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
  }

  function testTrainCapitalShipsCostIncrease() public {
    vm.startPrank(alice);
    bytes32 aliceHomeSpaceRock = world.spawn();
    vm.stopPrank();

    bytes32[] memory ownedAsteroids = ColoniesMap.getAsteroidIds(aliceEntity, AsteroidOwnedByKey);

    uint256 amount = P_CapitalShipConfig.getInitialCost();
    uint8 resource = P_CapitalShipConfig.getResource();
    increaseResource(aliceHomeSpaceRock, EResource(resource), amount);
    increaseResource(aliceHomeSpaceRock, EResource.U_CapitalShip, 1);
    trainUnits(alice, Home.get(aliceHomeSpaceRock), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
    assertEq(LibUnit.getCapitalShips(aliceEntity), 1, "colony ship count does not match expectation");
    assertEq(
      LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      2,
      "colony ship cost multiplier does not match expectation"
    );

    assertEq(
      amount * 2,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "colony ship 1 cost does not match expectation"
    );

    increaseResource(aliceHomeSpaceRock, EResource(resource), amount * 2);
    increaseResource(aliceHomeSpaceRock, EResource.U_CapitalShip, 1);
    trainUnits(alice, Home.get(aliceHomeSpaceRock), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
    assertEq(LibUnit.getCapitalShips(aliceEntity), 2, "colony ship count does not match expectation");
    assertEq(
      LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      4,
      "colony ship cost multiplier does not match expectation"
    );

    assertEq(
      amount * 4,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship 2 cost does not match expectation"
    );
  }

  function testFailTrainCapitalShipsNoCostIncrease() public {
    vm.startPrank(alice);
    bytes32 aliceHomeSpaceRock = world.spawn();
    vm.stopPrank();

    uint256 amount = P_CapitalShipConfig.getInitialCost() * 2;
    uint8 resource = P_CapitalShipConfig.getResource();
    increaseResource(aliceHomeSpaceRock, EResource(resource), amount);
    assertEq(
      amount,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship cost does not match expectation"
    );
    trainUnits(alice, EUnit.CapitalShip, 2, true);

    increaseResource(aliceHomeSpaceRock, EResource(resource), amount);
    assertEq(
      amount,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship cost does not match expectation"
    );
    trainUnits(alice, EUnit.CapitalShip, 1, true);
  }

  function testInvalidBuilding() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Can not train units using an in active building"));
    world.trainUnits(bytes32(0), unit, 1);
  }

  function testInvalidUnit() public {
    vm.expectRevert();
    world.trainUnits(building, EUnit(uint8(100)), 1);
  }
}
