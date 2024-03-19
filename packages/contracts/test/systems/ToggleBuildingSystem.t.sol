// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "test/PrimodiumTest.t.sol";
import { UnitProductionQueue } from "src/libraries/UnitProductionQueue.sol";
import { LibUnit } from "src/libraries/LibUnit.sol";

contract ToggleBuildingSystemTest is PrimodiumTest {
  bytes32 asteroidEntity = bytes32("asteroidEntity");
  bytes32 playerEntity;

  EUnit unit = EUnit(1);
  bytes32 unitPrototype = "unitPrototype";

  bytes32 ironMineEntity;
  PositionData ironMinePosition;
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
    playerEntity = addressToEntity(creator);
    world.Primodium__spawn();
    ironMinePosition = getTilePosition(Home.get(playerEntity), EBuilding.IronMine);
    ironMineEntity = world.Primodium__build(EBuilding.IronMine, ironMinePosition);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronPlateFactory)), 1);
    ironPlateFactoryPosition = getTilePosition(Home.get(playerEntity), EBuilding.IronPlateFactory);
    ironPlateFactory = world.Primodium__build(EBuilding.IronPlateFactory, ironPlateFactoryPosition);
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
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironProduction,
      "iron production doesn't match"
    );

    world.Primodium__toggleBuilding(ironMineEntity);

    assertTrue(!IsActive.get(ironMineEntity), "built iron mine should be in active");
    assertEq(ProductionRate.get(Home.get(playerEntity), uint8(EResource.Iron)), 0, "iron production should be 0");

    world.Primodium__toggleBuilding(ironMineEntity);
    assertTrue(IsActive.get(ironMineEntity), "built iron mine should be active");
    assertEq(
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironProduction,
      "iron production doesn't match"
    );
  }

  function testToggleProductionAndConsumption() public {
    assertEq(
      ConsumptionRate.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production doesn't match"
    );

    world.Primodium__toggleBuilding(ironPlateFactory);

    assertEq(ConsumptionRate.get(Home.get(playerEntity), uint8(EResource.Iron)), 0, "iron consumption doesn't match");
    assertEq(
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      0,
      "iron plate production doesn't match"
    );

    world.Primodium__toggleBuilding(ironPlateFactory);

    assertEq(
      ConsumptionRate.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production doesn't match"
    );
  }

  function testToggleClaimResources() public {
    vm.warp(block.timestamp);
    world.Primodium__toggleBuilding(ironPlateFactory);
    bytes32 home = Home.get(playerEntity);
    assertEq(ProductionRate.get(home, uint8(EResource.Iron)), ironProduction, "iron production doesn't match");
    assertEq(ConsumptionRate.get(home, uint8(EResource.Iron)), 0, "iron consumption should be 0");
    assertEq(ProductionRate.get(home, uint8(EResource.IronPlate)), 0, "iron plate production should be 0");

    vm.warp(block.timestamp + 10);
    world.Primodium__toggleBuilding(ironMineEntity);
    assertTrue(!IsActive.get(ironMineEntity), "iron mine should be in active");
    assertEq(
      ResourceCount.get(home, uint8(EResource.Iron)),
      ironProduction * 10,
      "resources should be claimed before toggle"
    );

    vm.warp(block.timestamp + 10);
    world.Primodium__toggleBuilding(ironMineEntity);
    assertTrue(IsActive.get(ironMineEntity), "iron mine should be active");
    assertEq(
      ResourceCount.get(home, uint8(EResource.Iron)),
      ironProduction * 10,
      "resources should not change when building is inactive"
    );

    vm.warp(block.timestamp + 10);
    LibResource.claimAllResources(home);
    assertEq(
      ResourceCount.get(home, uint8(EResource.Iron)),
      ironProduction * 20,
      "resources should be claimed after toggle"
    );
  }

  function testToggleClaimConsumeResources() public {
    vm.warp(block.timestamp);
    world.Primodium__toggleBuilding(ironMineEntity);

    assertEq(ProductionRate.get(Home.get(playerEntity), uint8(EResource.Iron)), 0, "iron production should be 0");
    assertEq(
      ConsumptionRate.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironConsumption,
      "iron consumption doesn't match"
    );
    assertEq(
      ProductionRate.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      ironPlateProduction,
      "iron plate production should be 0"
    );
    ResourceCount.set(Home.get(playerEntity), uint8(EResource.Iron), ironConsumption * 20);

    vm.warp(block.timestamp + 10);

    world.Primodium__toggleBuilding(ironPlateFactory);
    assertEq(
      ResourceCount.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironConsumption * 10,
      "iron should be consumed"
    );
    assertEq(
      ResourceCount.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      ironPlateProduction * 10,
      "iron plate should have been produced"
    );

    vm.warp(block.timestamp + 10);
    world.Primodium__toggleBuilding(ironPlateFactory);
    assertEq(
      ResourceCount.get(Home.get(playerEntity), uint8(EResource.Iron)),
      ironConsumption * 10,
      "iron should not have changed"
    );
    assertEq(
      ResourceCount.get(Home.get(playerEntity), uint8(EResource.IronPlate)),
      ironPlateProduction * 10,
      "iron plate should not have been changed"
    );
  }

  function testFailToggleBuildingTrainUnits() public {
    Level.set(Home.get(playerEntity), 2);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Garage)), 1);
    world.Primodium__build(EBuilding.Garage, getTilePosition(playerEntity, EBuilding.Garage));
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Workshop)), 1);
    PositionData memory workshopPosition = getTilePosition(playerEntity, EBuilding.Workshop);
    bytes32 workshop = world.Primodium__build(EBuilding.Workshop, workshopPosition);
    world.Primodium__toggleBuilding(workshop);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 1);

    world.Primodium__trainUnits(workshop, EUnit.MinutemanMarine, 10);
  }

  function testToggleBuildingTrainingUnits() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    Level.set(asteroidEntity, 2);
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Garage)), 1);
    world.Primodium__build(EBuilding.Garage, getTilePosition(asteroidEntity, EBuilding.Garage));
    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Workshop)), 1);
    PositionData memory workshopPosition = getTilePosition(asteroidEntity, EBuilding.Workshop);
    bytes32 workshop = world.Primodium__build(EBuilding.Workshop, workshopPosition);

    P_RequiredResources.deleteRecord(P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine)), 0);
    world.Primodium__trainUnits(workshop, EUnit.MinutemanMarine, 10);
    vm.expectRevert(bytes("[ToggleBuilding] Can not toggle building while it is training units"));
    world.Primodium__toggleBuilding(workshop);
  }

  function testToggleBuildingTrainingUnitsComplete() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    buildBuilding(creator, EBuilding.Garage);
    PositionData memory workshopPosition = getTilePosition(asteroidEntity, EBuilding.Workshop);
    bytes32 workshop = buildBuilding(creator, EBuilding.Workshop);

    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));

    P_RequiredResourcesData memory resources = P_RequiredResources.get(minutemanEntity, 1);
    provideResources(asteroidEntity, resources);

    vm.startPrank(creator);
    world.Primodium__trainUnits(workshop, EUnit.MinutemanMarine, 1);
    vm.warp(block.timestamp + LibUnit.getUnitBuildTime(workshop, minutemanEntity));
    console.log("units trained");
    assertFalse(UnitProductionQueue.isEmpty(workshop));
    world.Primodium__toggleBuilding(workshop);
    console.log("building toggled");
  }

  function testCannotToggleOtherPlayerBuilding() public {
    vm.startPrank(alice);
    vm.expectRevert(bytes("[ToggleBuilding] Only owner can toggle building"));
    world.Primodium__toggleBuilding(ironMineEntity);
  }

  function testFailToggleMainBase() public {
    switchPrank(creator);
    world.Primodium__toggleBuilding(Home.get(Home.get(playerEntity)));
  }
}
