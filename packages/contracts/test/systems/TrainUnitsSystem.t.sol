// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "test/PrimodiumTest.t.sol";

contract TrainUnitsSystemTest is PrimodiumTest {
  bytes32 asteroidEntity = bytes32("asteroidEntity");
  bytes32 player;
  bytes32 aliceEntity;
  bytes32 aliceAsteroidEntity;
  bytes32 shipyard;

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
    Asteroid.setIsAsteroid(asteroidEntity, true);
    Home.set(player, asteroidEntity);
    OwnedBy.set(building, asteroidEntity);
    Spawned.set(player, true);

    switchPrank(alice);
    aliceAsteroidEntity = world.Primodium__spawn();
    switchPrank(creator);
  }

  // copied from LibUnit.t.sol
  function setupClaimUnits() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp - 100);
    P_UnitProdMultiplier.set(buildingPrototype, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);

    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    UnitFactorySet.add(asteroidEntity, building);
  }

  function testCannotProduceUnit() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Building cannot produce unit"));
    world.Primodium__trainUnits(building, unit, 1);
  }

  function testTrainUnits() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 0, unitPrototypes);

    world.Primodium__trainUnits(building, unit, 1);
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
    world.Primodium__trainUnits(building, unit, 1);
  }

  function testTrainUnitsUpdateAsteroid() public {
    bytes32[] memory unitPrototypes = new bytes32[](1);
    unitPrototypes[0] = unitPrototype;
    P_UnitProdTypes.set(buildingPrototype, 1, unitPrototypes);

    Asteroid.setIsAsteroid(asteroidEntity, true);

    setupClaimUnits();
    Home.set(player, asteroidEntity);
    OwnedBy.set(asteroidEntity, player);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ProductionRate.set(asteroidEntity, Iron, 10);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);

    world.Primodium__trainUnits(building, unit, 1);
    LibUnit.claimUnits(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 100, "resource count");
    assertEq(UnitCount.get(asteroidEntity, unitPrototype), 100, "unit count");
  }

  function testTrainCapitalShip() public {
    uint256 multiplier = LibUnit.getCapitalShipCostMultiplier(aliceEntity);
    assertEq(multiplier, 1);
    uint256 amount = P_CapitalShipConfig.getInitialCost() * multiplier;
    assertEq(
      amount,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship cost"
    );
    uint8 resource = P_CapitalShipConfig.getResource();
    trainUnits(alice, EUnit.CapitalShip, 1, true);
    assertEq(ResourceCount.get(aliceAsteroidEntity, uint8(resource)), 0, "special resource should have been spent");
  }

  function testFailTrainCapitalShipNoSpecialResource() public {
    vm.stopPrank();
    increaseResource(aliceAsteroidEntity, EResource.U_CapitalShipCapacity, 1);
    //this func doesn't provide resources
    trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
  }

  function testTrainCapitalShipsCostIncrease() public {
    uint256 initialShips = LibUnit.getCapitalShipsPlusAsteroids(aliceEntity);
    uint256 initialMultiplier = LibUnit.getCapitalShipCostMultiplier(aliceEntity);
    assertEq(initialShips, 0, "initial ship and asteroid count");
    bytes32[] memory ownedAsteroids = ColoniesMap.getAsteroidEntities(aliceEntity, AsteroidOwnedByKey);

    uint256 amount = P_CapitalShipConfig.getInitialCost() * initialMultiplier;
    uint8 resource = P_CapitalShipConfig.getResource();
    increaseResource(aliceAsteroidEntity, EResource(resource), amount);
    increaseResource(aliceAsteroidEntity, EResource.U_CapitalShipCapacity, 1);
    trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
    assertEq(LibUnit.getCapitalShipsPlusAsteroids(aliceEntity), initialShips + 1, "colony ship count");
    assertEq(LibUnit.getCapitalShipCostMultiplier(aliceEntity), initialMultiplier * 2, "colony ship cost multiplier");

    assertEq(
      amount * 2,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "colony ship 1 cost"
    );

    increaseResource(aliceAsteroidEntity, EResource(resource), amount * 2);
    increaseResource(aliceAsteroidEntity, EResource.U_CapitalShipCapacity, 1);
    trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip)), 1, true);
    assertEq(LibUnit.getCapitalShipsPlusAsteroids(aliceEntity), initialShips + 2, "colony ship 2 count");
    assertEq(LibUnit.getCapitalShipCostMultiplier(aliceEntity), initialMultiplier * 2 * 2, "colony ship 2 cost");

    assertEq(
      amount * 4,
      P_CapitalShipConfig.getInitialCost() * LibUnit.getCapitalShipCostMultiplier(aliceEntity),
      "next colony ship 2 cost"
    );
  }

  function testInvalidBuilding() public {
    vm.expectRevert(bytes("[TrainUnitsSystem] Can not train units using an in active building"));
    world.Primodium__trainUnits(bytes32(0), unit, 1);
  }

  function testInvalidUnit() public {
    vm.expectRevert();
    world.Primodium__trainUnits(building, EUnit(uint8(100)), 1);
  }
}
