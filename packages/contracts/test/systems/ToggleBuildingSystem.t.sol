// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract ToggleBuildingSystemTest is PrimodiumTest {
  bytes32 rock = bytes32("rock");
  bytes32 player;

  EUnit unit = EUnit(1);
  bytes32 unitPrototype = "unitPrototype";

  bytes32 ironMineEntity;
  PositionData ironMinePostion;
  uint256 ironProduction;

  bytes32 ironPlateFactory;
  PositionData ironPlateFactoryPosition;
  uint256 ironConsumption;
  uint256 ironPlateProduction;
  bytes32 building = "building";
  bytes32 buildingPrototype = "buildingPrototype";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    world.spawn();
    ironMinePostion = getIronPosition(creator);
    ironMineEntity = world.build(EBuilding.IronMine, ironMinePostion);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronPlateFactory)), 1);
    ironPlateFactoryPosition = getCopperPosition(creator);
    ironPlateFactory = world.build(EBuilding.IronPlateFactory, ironPlateFactoryPosition);
    ironProduction = P_Production.getAmounts(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1)[0];
    ironConsumption = P_RequiredDependency.getAmount(
      P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronPlateFactory)),
      1
    );
    ironPlateProduction = P_Production.getAmounts(
      P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronPlateFactory)),
      1
    )[0];
  }

  function testBuildActiveDefault() public {
    assertTrue(IsActive.get(ironMineEntity), "built iron mine should be active");
    assertTrue(IsActive.get(ironPlateFactory), "built iron plate factory should be active");
  }

  function testToggleProduction() public {
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction,
      "iron production doesn't match"
    );

    world.toggleBuilding(ironMinePostion);

    assertTrue(!IsActive.get(ironMineEntity), "built iron mine should be in active");
    assertEq(ProductionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)), 0, "iron production should be 0");

    world.toggleBuilding(ironMinePostion);
    assertTrue(IsActive.get(ironMineEntity), "built iron mine should be active");
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction,
      "iron production doesn't match"
    );
  }

  function testToggleProductionAndConsumption() public {
    assertEq(
      ConsumptionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production doesn't match"
    );

    world.toggleBuilding(ironPlateFactoryPosition);

    assertEq(ConsumptionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)), 0, "iron consumption doesn't match");
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      0,
      "iron plate production doesn't match"
    );

    world.toggleBuilding(ironPlateFactoryPosition);

    assertEq(
      ConsumptionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production doesn't match"
    );
  }

  function testToggleClaimResources() public {
    vm.warp(block.timestamp);
    world.toggleBuilding(ironPlateFactoryPosition);
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction,
      "iron production doesn't match"
    );
    assertEq(ConsumptionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)), 0, "iron consumption should be 0");
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      0,
      "iron plate production should be 0"
    );

    vm.warp(block.timestamp + 10);
    world.toggleBuilding(ironMinePostion);
    assertTrue(!IsActive.get(ironMineEntity), "iron mine should be in active");
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction * 10,
      "resources should be claimed before toggle"
    );

    vm.warp(block.timestamp + 10);
    world.toggleBuilding(ironMinePostion);
    assertTrue(IsActive.get(ironMineEntity), "iron mine should be active");
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction * 10,
      "resources should not change when building is inactive"
    );

    vm.warp(block.timestamp + 10);
    LibResource.claimAllPlayerResources(player);
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironProduction * 20,
      "resources should be claimed after toggle"
    );
  }

  function testToggleClaimConsumeResources() public {
    vm.warp(block.timestamp);
    world.toggleBuilding(ironMinePostion);

    assertEq(ProductionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)), 0, "iron production should be 0");
    assertEq(
      ConsumptionRate.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production should be 0"
    );
    ResourceCount.set(Home.getAsteroid(player), uint8(EResource.Iron), ironConsumption * 20);

    vm.warp(block.timestamp + 10);

    world.toggleBuilding(ironPlateFactoryPosition);
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironConsumption * 10,
      "iron should be consumed"
    );
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      ironPlateProduction * 10,
      "iron plate should have been produced"
    );

    vm.warp(block.timestamp + 10);
    world.toggleBuilding(ironPlateFactoryPosition);
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.Iron)),
      ironConsumption * 10,
      "iron should not have changed"
    );
    assertEq(
      ResourceCount.get(Home.getAsteroid(player), uint8(EResource.IronPlate)),
      ironPlateProduction * 10,
      "iron plate should not have been changed"
    );
  }

  function testFailToggleBuildingTrainUnits() public {
    Level.set(Home.getAsteroid(player), 2);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Garage)), 1);
    world.build(EBuilding.Garage, getIronPosition2(creator));
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Workshop)), 1);
    bytes32 workshop = world.build(EBuilding.Workshop, getNonIronPosition(creator));
    world.toggleBuilding(getNonIronPosition(creator));
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 1);

    world.trainUnits(workshop, EUnit.MinutemanMarine, 10);
  }

  function testToggleBuildingTrainingUnits() public {
    Level.set(Home.getAsteroid(player), 2);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Garage)), 1);
    world.build(EBuilding.Garage, getPosition1(creator));
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Workshop)), 1);
    bytes32 workshop = world.build(EBuilding.Workshop, getPosition2(creator));

    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 0);
    world.trainUnits(workshop, EUnit.MinutemanMarine, 10);
    vm.expectRevert(bytes("[ToggleBuilding] Can not toggle building while it is training units"));
    world.toggleBuilding(getPosition2(creator));
  }

  function testToggleBuildingTrainingUnitsComplete() public {
    Level.set(Home.getAsteroid(player), 2);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Garage)), 1);
    world.build(EBuilding.Garage, getPosition1(creator));
    console.log("garage built");
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Workshop)), 1);
    bytes32 workshop = world.build(EBuilding.Workshop, getPosition2(creator));
    console.log("workshop built");
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 0);

    vm.warp(block.timestamp + 10);
    world.trainUnits(workshop, EUnit.MinutemanMarine, 10);
    console.log("units trained");
    vm.warp(
      block.timestamp + P_Unit.getTrainingTime(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 1) * 10
    );
    world.toggleBuilding(getPosition2(creator));
    console.log("building toggled");
  }

  function testCannotToggleOtherPlayerBuilding() public {
    vm.startPrank(alice);
    vm.expectRevert(bytes("[ToggleBuilding] Only owner can toggle building"));
    world.toggleBuilding(ironMinePostion);
  }

  function testFailToggleMainBase() public {
    switchPrank(creator);
    world.toggleBuilding(Position.get(Home.getMainBase(player)));
  }
}
