// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { HammerDronePrototypeId, AegisDronePrototypeId, ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { EResource, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";
import { LibColony } from "libraries/LibColony.sol";

import { GracePeriod, OwnedBy, P_Unit, P_GameConfig, CooldownEnd, Home, P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, FleetMovement, P_RequiredResources, P_RequiredResourcesData, UnitLevel, P_IsUtility, MaxColonySlots } from "codegen/index.sol";

contract TransferSystemTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);

    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);
  }

  function sendBobFleetToAliceAsteroid(bytes32 bobFleetEntity) private {
    vm.prank(creator);
    P_GameConfig.setWorldSpeed(100);
    vm.prank(bob);
    world.Primodium__sendFleet(bobFleetEntity, aliceHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(bobFleetEntity) + 1);
  }

  /* ------------------ left and right arent owned by player ------------------ */
  function testTransferTwoWayNotOwned() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 bobFleetEntity = spawnFleetWithUnitAndResource(
      bobHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    sendBobFleetToAliceAsteroid(bobFleetEntity);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Both entities not owned by player");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, bobFleetEntity, resources);
    vm.expectRevert("[TransferTwoWay] Both entities not owned by player");
    world.Primodium__transferResourcesTwoWay(bobFleetEntity, aliceFleetEntity, resources);
  }
  /* ---------------- left and right arent at the same location --------------- */
  function testTransferTwoWayNotSameLocation() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(aliceFleetEntity) + 1);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity2, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  /* ----------------------- left or right is in transit ---------------------- */
  function testTransferTwoWayInTransit() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(aliceFleetEntity) + 1);

    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, aliceHomeAsteroid);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Fleet in transit");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet in transit");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity2, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet in transit");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet in transit");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  /* ---------------------- left and right both not fleet --------------------- */
  function testTransferTwoWayBothNotFleet() public {
    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(100);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] At least one entity must be a fleet");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, bobHomeAsteroid, resources);

    vm.expectRevert("[TransferTwoWay] At least one entity must be a fleet");
    world.Primodium__transferResourcesTwoWay(bobHomeAsteroid, aliceHomeAsteroid, resources);
  }

  /* ---------------------- left or right is in cooldown ---------------------- */
  function testTransferTwoWayInCooldown() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );

    vm.prank(creator);
    CooldownEnd.set(aliceFleetEntity, block.timestamp + 1);
    vm.startPrank(alice);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity2, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  /* ------------------------- resources length wrong ------------------------- */

  function testTransferTwoWayResourceLengthWrong() public {
    int256[] memory resources = new int256[](P_Transportables.length() - 1);
    vm.expectRevert("[TransferTwoWay] Incorrect resource array length");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceHomeAsteroid, resources);
  }

  /* ---------------------------- resources two way --------------------------- */
  function testTransferTwoWayResourcesFleetAsteroid() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    increaseResource(aliceHomeAsteroid, EResource.Copper, ironCount);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = 1;
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -1;
    }
    vm.startPrank(alice);
    // should fail because its inverted (positive should be on the left)
    vm.expectRevert();
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
    assertEq(ResourceCount.get(aliceHomeAsteroid, Iron), 1);
    assertEq(ResourceCount.get(aliceHomeAsteroid, Copper), 99);
    assertEq(ResourceCount.get(aliceFleetEntity, Copper), 1);
    assertEq(ResourceCount.get(aliceFleetEntity, Iron), 99);
  }

  function testTransferTwoWayResourcesFleetFleet() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Copper,
      ironCount
    );

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = 1;
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -1;
    }
    vm.startPrank(alice);
    // should fail because its inverted (positive should be on the left)
    vm.expectRevert();
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity2, aliceFleetEntity, resources);

    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);
    assertEq(ResourceCount.get(aliceFleetEntity2, Iron), 1);
    assertEq(ResourceCount.get(aliceFleetEntity2, Copper), 99);
    assertEq(ResourceCount.get(aliceFleetEntity, Copper), 1);
    assertEq(ResourceCount.get(aliceFleetEntity, Iron), 99);
  }

  function testTransferTwoWayResourcesCargo() public {
    uint256 cargoCapacity = P_Unit.getCargo(AegisDronePrototypeId, 0);

    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      1,
      EResource.Iron,
      cargoCapacity
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      1,
      EResource.Copper,
      cargoCapacity
    );

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(cargoCapacity);
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -int256(cargoCapacity);
    }
    vm.startPrank(alice);
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);
    assertEq(ResourceCount.get(aliceFleetEntity2, Iron), cargoCapacity);
    assertEq(ResourceCount.get(aliceFleetEntity2, Copper), 0);
    assertEq(ResourceCount.get(aliceFleetEntity, Copper), cargoCapacity);
    assertEq(ResourceCount.get(aliceFleetEntity, Iron), 0);
  }

  function testTransferTwoWayResourcesFailCargoOverflow() public {
    uint256 cargoCapacity = P_Unit.getCargo(AegisDronePrototypeId, 0);

    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      1,
      EResource.Iron,
      cargoCapacity
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      1,
      EResource.Copper,
      cargoCapacity
    );

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(cargoCapacity) - 1;
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -int256(cargoCapacity);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Not enough cargo space");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);
  }

  /* --------------------------- units length wrong --------------------------- */
  function testTransferTwoWayUnitLengthWrong() public {
    int256[] memory units = new int256[](P_UnitPrototypes.length() - 1);
    vm.expectRevert("[TransferTwoWay] Incorrect unit array length");
    world.Primodium__transferUnitsTwoWay(aliceHomeAsteroid, aliceHomeAsteroid, units);
  }
  /* ------------------------------ units two way ----------------------------- */
  function testTransferTwoWayUnitsFleetAsteroid() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnit(aliceHomeAsteroid, EUnit.AegisDrone, 100);

    increaseResource(aliceHomeAsteroid, EResource.Copper, ironCount);
    trainUnits(alice, EUnit.HammerDrone, 100, true);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 1;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }
    vm.startPrank(alice);
    // should fail because its inverted (positive should be on the left)
    vm.expectRevert();
    world.Primodium__transferUnitsTwoWay(aliceHomeAsteroid, aliceFleetEntity, units);

    uint256 aliceHomeAsteroidHousing = ResourceCount.get(aliceHomeAsteroid, uint8(EResource.U_Housing));
    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceHomeAsteroid, units);
    assertEq(aliceHomeAsteroidHousing, ResourceCount.get(aliceHomeAsteroid, uint8(EResource.U_Housing)));
    assertEq(UnitCount.get(aliceHomeAsteroid, AegisDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceHomeAsteroid, HammerDronePrototypeId), 99);
    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 99);
  }

  function testTransferTwoWayUnitsFleetFleet() public {
    bytes32 aliceFleetEntity = spawnFleetWithUnit(aliceHomeAsteroid, EUnit.AegisDrone, 100);
    bytes32 aliceFleetEntity2 = spawnFleetWithUnit(aliceHomeAsteroid, EUnit.HammerDrone, 100);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 1;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }

    vm.startPrank(alice);
    // should fail because its inverted (positive should be on the left)
    vm.expectRevert();
    world.Primodium__transferUnitsTwoWay(aliceFleetEntity2, aliceFleetEntity, units);

    uint256 aliceHomeAsteroidHousing = ResourceCount.get(aliceHomeAsteroid, uint8(EResource.U_Housing));
    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceFleetEntity2, units);
    assertEq(aliceHomeAsteroidHousing, ResourceCount.get(aliceHomeAsteroid, uint8(EResource.U_Housing)));
    assertEq(UnitCount.get(aliceFleetEntity2, AegisDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity2, HammerDronePrototypeId), 99);
    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 99);
  }

  /* ----------- resources two way with intermediary cargo overflow ----------- */
  function testTransferTwoWayUnitsCargo() public {
    uint256 cargoCapacity = P_Unit.getCargo(AegisDronePrototypeId, 0) * 100;

    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      cargoCapacity
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnit(aliceHomeAsteroid, EUnit.HammerDrone, 100);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 1;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -100;
    }

    vm.startPrank(alice);

    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceFleetEntity2, units);
    assertEq(UnitCount.get(aliceFleetEntity2, AegisDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity2, HammerDronePrototypeId), 0);

    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 100);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 99);
  }

  function testTransferTwoWayFailUnitsCargoOverflow() public {
    uint256 cargoCapacity = P_Unit.getCargo(AegisDronePrototypeId, 0) * 100;

    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      cargoCapacity
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnit(aliceHomeAsteroid, EUnit.HammerDrone, 100);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 10;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }

    vm.startPrank(alice);

    vm.expectRevert("[TransferTwoWay] Not enough cargo space");
    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceFleetEntity2, units);
  }

  function testTransferTwoWayUnitsFailUtilityOverflow() public {
    // clear grace period
    vm.warp(GracePeriod.get(bobHomeAsteroid) + 1);

    conquerAsteroid(alice, aliceHomeAsteroid, bobHomeAsteroid);
    bytes32 playerEntity = OwnedBy.get(bobHomeAsteroid);
    assertEq(playerEntity, aliceEntity);
    bytes32 aliceFleetEntity = spawnFleetWithUnit(bobHomeAsteroid, EUnit.AegisDrone, 100);

    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, aliceHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(aliceFleetEntity) + 1);

    trainUnits(alice, EUnit.HammerDrone, 100, true);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 100;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }
    vm.startPrank(alice);
    vm.expectRevert("[LibUnit] Not enough utility resources");
    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceHomeAsteroid, units);
  }

  /* ------------- units two way with intermediary cargo overflow ------------- */

  function setHousingEqual() public {
    P_RequiredResourcesData memory reqHousing = P_RequiredResourcesData({
      resources: new uint8[](1),
      amounts: new uint256[](1)
    });
    reqHousing.resources[0] = uint8(EResource.U_Housing);
    reqHousing.amounts[0] = 2;

    vm.startPrank(creator);
    P_RequiredResources.set(AegisDronePrototypeId, 0, reqHousing);
    P_RequiredResources.set(HammerDronePrototypeId, 0, reqHousing);
    vm.stopPrank();
  }

  function testTransferTwoWayUnitsUtility() public {
    // clear grace period

    setHousingEqual();

    vm.warp(GracePeriod.get(bobHomeAsteroid) + 1);

    conquerAsteroid(alice, aliceHomeAsteroid, bobHomeAsteroid);
    bytes32 playerEntity = OwnedBy.get(bobHomeAsteroid);
    assertEq(playerEntity, aliceEntity);
    bytes32 aliceFleetEntity = spawnFleetWithUnit(bobHomeAsteroid, EUnit.AegisDrone, 100);

    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, aliceHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(aliceFleetEntity) + 1);

    trainUnits(alice, EUnit.HammerDrone, 100, true);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 100;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -100;
    }
    vm.startPrank(alice);

    world.Primodium__transferUnitsTwoWay(aliceFleetEntity, aliceHomeAsteroid, units);
    assertEq(UnitCount.get(aliceHomeAsteroid, AegisDronePrototypeId), 100);
    assertEq(UnitCount.get(aliceHomeAsteroid, HammerDronePrototypeId), 0);

    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 100);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 0);
  }

  /* ------ units and resources two way with intermediary cargo overflow ------ */
  /* ----- units and resources two way with intermediary utility overflow ----- */
  /* --------------------- units or resources length wrong -------------------- */

  function testTransferTwoWayUnitsAndResourcesLengthWrong() public {
    int256[] memory resources = new int256[](P_Transportables.length() - 1);
    int256[] memory units = new int256[](P_UnitPrototypes.length() - 1);
    vm.expectRevert("[TransferTwoWay] Incorrect unit array length");
    world.Primodium__transferUnitsAndResourcesTwoWay(aliceHomeAsteroid, aliceHomeAsteroid, units, resources);
  }

  /* ----------------------- units and resources two way ---------------------- */
  function testTransferTwoWayUnitsAndResourcesFleetAsteroid() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    increaseResource(aliceHomeAsteroid, EResource.Copper, ironCount);
    trainUnits(alice, EUnit.HammerDrone, 100, true);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = 1;
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -1;
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 1;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }
    vm.startPrank(alice);
    // should fail because its inverted (positive should be on the left)
    vm.expectRevert();
    world.Primodium__transferUnitsAndResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, units, resources);

    world.Primodium__transferUnitsAndResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, units, resources);
    assertEq(ResourceCount.get(aliceHomeAsteroid, Iron), 1);
    assertEq(ResourceCount.get(aliceHomeAsteroid, Copper), 99);
    assertEq(ResourceCount.get(aliceFleetEntity, Copper), 1);
    assertEq(ResourceCount.get(aliceFleetEntity, Iron), 99);

    assertEq(UnitCount.get(aliceHomeAsteroid, AegisDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceHomeAsteroid, HammerDronePrototypeId), 99);

    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 99);
  }

  function testTransferTwoWayUnitsAndResourcesFleetFleet() public {
    setHousingEqual();
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    vm.warp(GracePeriod.get(bobHomeAsteroid) + 1);
    conquerAsteroid(alice, aliceHomeAsteroid, bobHomeAsteroid);
    bytes32 playerEntity = OwnedBy.get(bobHomeAsteroid);
    assertEq(playerEntity, aliceEntity);
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      bobHomeAsteroid,
      EUnit.HammerDrone,
      100,
      EResource.Copper,
      ironCount
    );

    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity2, aliceHomeAsteroid);
    vm.warp(FleetMovement.getArrivalTime(aliceFleetEntity2) + 1);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = 1;
      if (P_Transportables.getItemValue(i) == Copper) resources[i] = -1;
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    int256[] memory units = new int256[](unitPrototypes.length);
    for (uint256 i = 0; i < units.length; i++) {
      if (unitPrototypes[i] == AegisDronePrototypeId) units[i] = 1;
      if (unitPrototypes[i] == HammerDronePrototypeId) units[i] = -1;
    }
    vm.startPrank(alice);
    world.Primodium__transferUnitsAndResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, units, resources);
    assertEq(ResourceCount.get(aliceFleetEntity2, Iron), 1);
    assertEq(ResourceCount.get(aliceFleetEntity2, Copper), 99);
    assertEq(ResourceCount.get(aliceFleetEntity, Copper), 1);
    assertEq(ResourceCount.get(aliceFleetEntity, Iron), 99);

    assertEq(UnitCount.get(aliceFleetEntity2, AegisDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity2, HammerDronePrototypeId), 99);

    assertEq(UnitCount.get(aliceFleetEntity, HammerDronePrototypeId), 1);
    assertEq(UnitCount.get(aliceFleetEntity, AegisDronePrototypeId), 99);
  }
}
