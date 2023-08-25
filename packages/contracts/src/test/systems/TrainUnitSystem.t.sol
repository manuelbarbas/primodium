// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { TrainUnitsSystem, ID as TrainUnitsSystemID } from "../../systems/TrainUnitsSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";

import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID, ResourceValue } from "components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "components/UnitProductionLastQueueIndexComponent.sol";
import { S_UpdatePlayerSpaceRockSystem, ID as S_UpdatePlayerSpaceRockSystemID } from "../../systems/S_UpdatePlayerSpaceRockSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "../../components/P_BlueprintComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "../../components/UnitsComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../../components/P_MaxStorageComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
import { ElectricityUtilityResourceID } from "../../prototypes.sol";
import { BIGNUM } from "../../prototypes/Debug.sol";
//debug buildings
import "../../prototypes.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibBlueprint } from "../../libraries/LibBlueprint.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { ResourceValue, ResourceValues } from "../../types.sol";

// todo: test that resources and utilities are being updated
contract TrainUnitSystem is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BuildSystem public buildSystem;
  TrainUnitsSystem public trainUnitsSystem;
  UpgradeBuildingSystem public upgradeBuildingSystem;
  S_UpdatePlayerSpaceRockSystem public updateSystem;

  P_UtilityProductionComponent public utilityProductionComponent;

  function setUp() public override {
    super.setUp();
    utilityProductionComponent = P_UtilityProductionComponent(component(P_UtilityProductionComponentID));
    // init systems
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    updateSystem = S_UpdatePlayerSpaceRockSystem(system(S_UpdatePlayerSpaceRockSystemID));
    // init other
    spawn(alice);
  }

  function testTrainUnitsu() public {
    vm.startPrank(alice);
    UnitProductionQueueIndexComponent unitQueueIndexComponent = UnitProductionQueueIndexComponent(
      world.getComponent(UnitProductionQueueIndexComponentID)
    );
    UnitProductionLastQueueIndexComponent unitLastQueueIndexComponent = UnitProductionLastQueueIndexComponent(
      world.getComponent(UnitProductionLastQueueIndexComponentID)
    );

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(alice));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 10);
    uint256 queueIndex = 0;
    assertEq(unitQueueIndexComponent.getValue(unitProductionBuildingEntityID), queueIndex);
    assertEq(unitLastQueueIndexComponent.getValue(unitProductionBuildingEntityID), queueIndex);

    uint256 buildingQueueEntity = LibEncode.hashKeyEntity(unitProductionBuildingEntityID, queueIndex);
    ResourceValue memory unitTypeCount = UnitProductionQueueComponent(
      world.getComponent(UnitProductionQueueComponentID)
    ).getValue(buildingQueueEntity);
    assertEq(unitTypeCount.resource, DebugUnit);
    assertEq(unitTypeCount.value, 10);
  }

  function testTrainAndClaimUnits() public {
    testTrainUnitsu();
    vm.roll(30);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units on asteroid");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units on asteroid");
  }

  function testTrainUnitsMultipleBuildings() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));

    bytes memory unitProductionBuildingEntity2 = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getCopperCoord(alice)
    );
    uint256 unitProductionBuildingEntity2ID = abi.decode(unitProductionBuildingEntity2, (uint256));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 5);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntity2ID, DebugUnit, 5);
    vm.roll(20);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units");

    vm.stopPrank();
  }

  function testTrainUnitsQueue() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 1);
    vm.roll(30);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units");

    vm.stopPrank();
  }

  function testTrainUnitsMidQueue() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 3);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 1);
    vm.roll(20);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 5, "player should have 5 units");
    vm.roll(30);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units");

    vm.stopPrank();
  }

  function testTrainUnitsMidProduction() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 10);
    vm.roll(20);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 5, "player should have 5 units");
    vm.roll(30);

    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units");

    vm.roll(40);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 10, "player should have 10 units");

    vm.stopPrank();
  }

  function testTrainUnitsUpgradeUnitProduction() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));

    upgradeBuildingSystem.executeTyped(getIronCoord(alice));
    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 10);
    vm.roll(20);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have units");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 5, "player should have 5 units");

    vm.stopPrank();
  }

  function testTrainDifferentUnitTypesQueue() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugHousingBuilding, getCoord1(alice));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord2(alice));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(alice));

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    upgradeBuildingSystem.executeTyped(getIronCoord(alice));
    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 5);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit2, 5);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit2, 5);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 10);
    vm.roll(15);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    UnitsComponent unitsComponent = UnitsComponent(component(UnitsComponentID));
    uint256 playerUnitAsteroidEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity), "player should have DebugUnit");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 2, "player should have 2 DebugUnit");
    vm.roll(25);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    uint256 playerUnitAsteroidEntity2 = LibEncode.hashEntities(
      DebugUnit2,
      addressToEntity(alice),
      getHomeAsteroid(alice)
    );
    assertTrue(unitsComponent.has(playerUnitAsteroidEntity2), "player should have DebugUnit2");
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity2), 1, "player should have 1 DebugUnit2");
    vm.roll(35);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity2), 3, "player should have 3 DebugUnit2");
    vm.roll(45);
    updateSystem.executeTyped(alice, getHomeAsteroid(alice));
    assertEq(unitsComponent.getValue(playerUnitAsteroidEntity), 5, "player should have 5 DebugUnit");
    vm.stopPrank();
  }

  function testFailTrainUnitsHousing() public {
    vm.startPrank(alice);

    Coord memory coord1 = getCoord1(alice);
    buildSystem.executeTyped(DebugHousingBuilding, coord1);

    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    uint32 housingUtility = utilityProductionComponent.getValue(LibEncode.hashKeyEntity(DebugHousingBuilding, 1)).value;
    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, housingUtility + 1);

    vm.stopPrank();
  }
}
