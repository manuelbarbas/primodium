// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { entityToAddress, addressToEntity } from "src/utils.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { BuildingKey, UnitKey } from "src/Keys.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { P_Unit, CooldownEnd, P_IsUtility, MaxResourceCount, ResourceCount, P_UnitPrototypes, P_GameConfig, P_GameConfigData, P_Unit, P_Transportables, BuildingType, OwnedBy, FleetMovement, P_Blueprint, P_EnumToPrototype, PositionData, Position, P_RequiredResourcesData, Asteroid, Home, P_RequiredTile, P_MaxLevel, P_RequiredResources, P_RequiredBaseLevel, UnitLevel, P_ColonyShipConfig, Level, P_UnitProdTypes, P_UnitProdMultiplier, P_WormholeAsteroidConfig, P_AsteroidProbabilityConfig } from "codegen/index.sol";
import { EResource, EBuilding, EUnit, Bounds } from "src/Types.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibColony } from "libraries/LibColony.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";

struct PositionData2D {
  int32 x;
  int32 y;
}

function toString(bytes32 entity) pure returns (string memory) {
  return string(abi.encodePacked(entity));
}

contract PrimodiumTest is MudTest {
  IWorld public world;
  uint256 userNonce = 0;
  uint256 MAX_INT = 2 ** 256 - 1;

  address creator;
  address payable alice;
  address payable bob;
  address payable eve;

  uint8 Iron = uint8(EResource.Iron);
  uint8 Copper = uint8(EResource.Copper);
  uint8 Platinum = uint8(EResource.Platinum);
  uint8 U_MaxFleets = uint8(EResource.U_MaxFleets);
  uint8 Kimberlite = uint8(EResource.Kimberlite);
  uint8 Lithium = uint8(EResource.Lithium);
  uint8 Titanium = uint8(EResource.Titanium);

  function setUp() public virtual override {
    super.setUp();
    world = IWorld(worldAddress);
    address namespaceOwner = NamespaceOwner.get(WorldResourceIdLib.encodeNamespace(bytes14("Primodium")));
    creator = namespaceOwner;

    alice = getUser();
    bob = getUser();
    eve = getUser();
  }

  function getUser() internal returns (address payable) {
    address payable user = payable(address(uint160(uint256(keccak256(abi.encodePacked(userNonce++))))));
    vm.deal(user, 100 ether);
    return user;
  }

  modifier prank(address prankster) {
    vm.startPrank(prankster);
    _;
    vm.stopPrank();
  }

  function switchPrank(address prankster) internal {
    vm.stopPrank();
    vm.startPrank(prankster);
  }

  function assertEq(PositionData memory coordA, PositionData memory coordB) internal {
    assertEq(coordA.x, coordB.x, "[assertEq]: x doesn't match");
    assertEq(coordA.y, coordB.y, "[assertEq]: y doesn't match");
    assertEq(coordA.parentEntity, coordB.parentEntity, "[assertEq]: parentEntity doesn't match");
  }

  function assertXYNotEq(PositionData memory coordA, PositionData memory coordB) internal {
    assertTrue(coordA.x != coordB.x || coordA.y != coordB.y, "[assertNe]: positions match");
  }

  function assertEq(EResource a, EResource b) internal {
    assertEq(uint256(a), uint256(b));
  }

  function logPosition(PositionData memory coord) internal view {
    console.log("x");
    console.logInt(coord.x);
    console.log("y");
    console.logInt(coord.y);
    console.log("parent", uint256(coord.parentEntity));
  }

  function canPlaceBuildingTiles(
    bytes32 asteroidEntity,
    bytes32 buildingPrototype,
    PositionData memory position
  ) internal view returns (bool) {
    int32[] memory blueprint = P_Blueprint.get(buildingPrototype);
    int32[] memory tileCoords = new int32[](blueprint.length);
    Bounds memory bounds = LibBuilding.getAsteroidBounds(asteroidEntity);
    for (uint256 i = 0; i < blueprint.length; i += 2) {
      int32 x = blueprint[i] + position.x;
      int32 y = blueprint[i + 1] + position.y;
      if (bounds.minX > x || bounds.minY > y || bounds.maxX < x || bounds.maxY < y) return false;
      tileCoords[i] = blueprint[i] + position.x;
      tileCoords[i + 1] = blueprint[i + 1] + position.y;
    }
    return LibAsteroid.allTilesAvailable(asteroidEntity, tileCoords);
  }

  function getTilePosition(bytes32 asteroidEntity, EBuilding buildingType) internal view returns (PositionData memory) {
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(buildingType));
    Bounds memory bounds = LibBuilding.getAsteroidBounds(asteroidEntity);
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        PositionData memory coord = PositionData(i, j, asteroidEntity);
        if (!LibBuilding.canBuildOnTile(buildingPrototype, coord)) continue;
        if (!canPlaceBuildingTiles(asteroidEntity, buildingPrototype, coord)) continue;
        return coord;
      }
    }
    revert("Valid tile position not found");
  }

  function spawn(address player) internal returns (bytes32) {
    vm.prank(player);
    world.Primodium__spawn();
    bytes32 playerEntity = addressToEntity(player);
    bytes32 homeAsteroidEntity = Home.get(playerEntity);
    return homeAsteroidEntity;
  }

  function get2x2Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](8);

    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = -1;
    blueprint[5] = 0;

    blueprint[6] = -1;
    blueprint[7] = -1;
  }

  function removeRequiredTile(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    P_RequiredTile.deleteRecord(buildingEntity);
  }

  function removeRequiredResources(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    uint256 buildingMaxLevel = P_MaxLevel.get(buildingEntity);
    for (uint256 i = 0; i <= buildingMaxLevel; i++) {
      P_RequiredResources.deleteRecord(buildingEntity, i);
    }
  }

  function removeRequiredMainBase(EBuilding building) internal {
    bytes32 buildingEntity = P_EnumToPrototype.get(BuildingKey, uint8(building));
    uint256 buildingMaxLevel = P_MaxLevel.get(buildingEntity);
    for (uint256 i = 0; i <= buildingMaxLevel; i++) {
      P_RequiredBaseLevel.deleteRecord(buildingEntity, i);
    }
  }

  function removeRequirements(EBuilding building) internal {
    removeRequiredTile(building);
  }

  function getUnitArray(uint256 unit1Count, uint256 unit2Count) internal pure returns (uint256[] memory unitArray) {
    unitArray = new uint256[](8);
    //unitArray = new uint256[](P_UnitPrototypes.length());
    unitArray[0] = unit1Count;
    unitArray[1] = unit2Count;
    return unitArray;
  }

  function trainUnits(address player, EUnit unitType, uint256 count, bool fastForward) internal {
    trainUnits(player, P_EnumToPrototype.get(UnitKey, uint8(unitType)), count, fastForward);
  }

  function trainUnits(address player, bytes32 unitPrototype, uint256 count, bool fastForward) internal {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 asteroidEntity = Home.get(playerEntity);
    bytes32 mainBase = Home.get(asteroidEntity);
    P_RequiredResourcesData memory requiredResources = getTrainCost(
      unitPrototype,
      UnitLevel.get(asteroidEntity, unitPrototype),
      count
    );

    provideResources(asteroidEntity, requiredResources);

    if (unitPrototype == P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip))) {
      uint256 countLeft = count;
      while (countLeft > 0) {
        trainUnits(player, mainBase, unitPrototype, 1, fastForward);
        countLeft--;
      }
    } else {
      trainUnits(player, mainBase, unitPrototype, count, fastForward);
    }
  }

  function trainUnits(
    address player,
    bytes32 buildingEntity,
    bytes32 unitPrototype,
    uint256 count,
    bool fastForward
  ) internal {
    vm.startPrank(creator);

    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);

    bytes32[] memory prodTypes = P_UnitProdTypes.get(buildingType, level);
    bytes32[] memory newProdTypes = new bytes32[](1);
    newProdTypes[0] = unitPrototype;

    P_UnitProdTypes.set(buildingType, level, newProdTypes);
    P_UnitProdMultiplier.set(buildingType, level, 100);
    if (!UnitFactorySet.has(Position.getParentEntity(buildingEntity), buildingEntity))
      UnitFactorySet.add(Position.getParentEntity(buildingEntity), buildingEntity);

    // if (unitPrototype == ColonyShipPrototypeId) {
    //   LibColony.increaseMaxColonySlots(addressToEntity(player));
    // }
    vm.stopPrank();

    vm.startPrank(player);
    world.Primodium__trainUnits(buildingEntity, unitPrototype, count);
    if (fastForward) {
      uint256 unitLevel = UnitLevel.get(Position.getParentEntity(buildingEntity), unitPrototype);
      switchPrank(creator);
      P_Unit.setTrainingTime(unitPrototype, unitLevel, 0);
      vm.warp(block.timestamp + 1);
    }

    switchPrank(creator);
    P_UnitProdTypes.set(buildingType, level, prodTypes);
    vm.stopPrank();
  }

  function upgradeMainBase(address player) internal {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 asteroidEntity = Home.get(playerEntity);
    bytes32 mainBase = Home.get(asteroidEntity);
    P_RequiredResourcesData memory requiredResources = getUpgradeCost(mainBase);
    provideResources(asteroidEntity, requiredResources);
    upgradeBuilding(player, mainBase);
  }

  function upgradeMainBase(address player, uint256 level) internal {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 asteroidEntity = Home.get(playerEntity);
    bytes32 mainBase = Home.get(asteroidEntity);
    while (Level.get(mainBase) < level) {
      upgradeBuilding(player, mainBase);
    }
  }

  function upgradeBuilding(address player, bytes32 buildingEntity) internal {
    P_RequiredResourcesData memory requiredResources = getUpgradeCost(buildingEntity);
    provideResources(Position.getParentEntity(buildingEntity), requiredResources);
    uint256 requiredMainBaseLevel = P_RequiredBaseLevel.get(
      BuildingType.get(buildingEntity),
      Level.get(buildingEntity) + 1
    );
    upgradeMainBase(player, requiredMainBaseLevel);
    vm.startPrank(player);
    world.Primodium__upgradeBuilding(buildingEntity);
    vm.stopPrank();
  }

  function buildBuilding(address player, EBuilding building) internal returns (bytes32) {
    P_RequiredResourcesData memory requiredResources = getBuildCost(building);
    PositionData memory position = getTilePosition(Home.get(addressToEntity(player)), building);
    provideResources(position.parentEntity, requiredResources);
    uint256 requiredMainBaseLevel = P_RequiredBaseLevel.get(P_EnumToPrototype.get(BuildingKey, uint8(building)), 1);
    upgradeMainBase(player, requiredMainBaseLevel);
    vm.startPrank(player);
    bytes32 buildingEntity = world.Primodium__build(building, position);
    vm.stopPrank();
    return buildingEntity;
  }

  function provideMaxStorage(bytes32 asteroidEntity, P_RequiredResourcesData memory requiredResources) internal {
    vm.startPrank(creator);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i])) continue;
      if (MaxResourceCount.get(asteroidEntity, requiredResources.resources[i]) < requiredResources.amounts[i])
        LibStorage.increaseMaxStorage(
          asteroidEntity,
          requiredResources.resources[i],
          requiredResources.amounts[i] - MaxResourceCount.get(asteroidEntity, requiredResources.resources[i])
        );
    }
    vm.stopPrank();
  }

  function provideResources(bytes32 asteroidEntity, P_RequiredResourcesData memory requiredResources) internal {
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      increaseResource(asteroidEntity, EResource(requiredResources.resources[i]), requiredResources.amounts[i]);
    }
  }

  function claimResources(bytes32 asteroidEntity) internal {
    vm.startPrank(creator);
    world.Primodium__claimResources(asteroidEntity);
    vm.stopPrank();
  }

  function increaseProduction(bytes32 asteroidEntity, EResource resource, uint256 amount) internal {
    vm.startPrank(creator);
    LibProduction.increaseResourceProduction(asteroidEntity, resource, amount);
    vm.stopPrank();
  }

  function increaseResource(bytes32 asteroidEntity, EResource resourceType, uint256 count) internal {
    vm.startPrank(creator);
    if (P_IsUtility.get(uint8(resourceType))) {
      LibProduction.increaseResourceProduction(asteroidEntity, resourceType, count);
    } else {
      if (MaxResourceCount.get(asteroidEntity, uint8(resourceType)) < count)
        LibStorage.increaseMaxStorage(
          asteroidEntity,
          uint8(resourceType),
          count - MaxResourceCount.get(asteroidEntity, uint8(resourceType))
        );
      LibStorage.increaseStoredResource(asteroidEntity, uint8(resourceType), count);
    }
    vm.stopPrank();
  }

  function getTrainCost(
    EUnit unitType,
    uint256 level,
    uint256 count
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unitType));
    requiredResources = getTrainCost(unitPrototype, level, count);
  }

  function getTrainCost(
    bytes32 unitPrototype,
    uint256 level,
    uint256 count
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    requiredResources = P_RequiredResources.get(unitPrototype, level);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      requiredResources.amounts[i] *= count;
    }
  }

  function getBuildCost(
    EBuilding buildingType
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(buildingType));
    requiredResources = P_RequiredResources.get(buildingPrototype, 1);
  }

  function getUpgradeCost(
    bytes32 buildingEntity
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    uint256 level = Level.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    requiredResources = P_RequiredResources.get(buildingPrototype, level + 1);
  }

  function setupCreateFleet(
    address player,
    bytes32 asteroidEntity,
    uint256[] memory unitCounts,
    uint256[] memory resourceCounts
  ) public {
    if (ResourceCount.get(asteroidEntity, uint8(EResource.U_MaxFleets)) == 0) {
      increaseProduction(asteroidEntity, EResource.U_MaxFleets, 1);
    }
    setupCreateFleetNoMaxMovesGranted(player, asteroidEntity, unitCounts, resourceCounts);
  }

  function setupCreateFleetNoMaxMovesGranted(
    address player,
    bytes32 asteroidEntity,
    uint256[] memory unitCounts,
    uint256[] memory resourceCounts
  ) public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      trainUnits(player, unitPrototypes[i], unitCounts[i], true);
    }
    uint8[] memory transportables = P_Transportables.get();
    for (uint256 i = 0; i < transportables.length; i++) {
      increaseResource(asteroidEntity, EResource(transportables[i]), resourceCounts[i]);
    }
  }

  function findSecondaryAsteroid(bytes32 asteroidEntity) public returns (PositionData memory) {
    switchPrank(creator);
    P_GameConfig.setAsteroidChanceInv(1);
    P_GameConfigData memory config = P_GameConfig.get();
    PositionData memory sourcePosition = Position.get(asteroidEntity);
    bytes32 asteroidSeed;
    PositionData memory targetPosition;
    uint256 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      if (i == P_WormholeAsteroidConfig.getWormholeAsteroidSlot()) {
        i++;
        continue;
      }
      PositionData memory targetPositionRelative = LibAsteroid.getPosition(
        i,
        config.asteroidDistance,
        config.maxAsteroidsPerPlayer
      );
      targetPosition = PositionData(
        sourcePosition.x - targetPositionRelative.x,
        sourcePosition.y - targetPositionRelative.y,
        0
      );
      console.log("position %s: ", i);
      logPosition(targetPosition);

      asteroidSeed = keccak256(abi.encode(asteroidEntity, bytes32("asteroid"), targetPosition.x, targetPosition.y));
      found = LibAsteroid.isAsteroid(asteroidSeed, config.asteroidChanceInv, i);
      i++;
    }
    require(found, "uh oh, no asteroid found");
    vm.stopPrank();
    return (targetPosition);
  }

  function findWormholeAsteroid(bytes32 asteroidEntity) public view returns (PositionData memory) {
    P_GameConfigData memory config = P_GameConfig.get();
    PositionData memory sourcePosition = Position.get(asteroidEntity);
    logPosition(sourcePosition);

    PositionData memory targetPositionRelative = LibAsteroid.getPosition(
      P_WormholeAsteroidConfig.getWormholeAsteroidSlot(),
      config.asteroidDistance,
      config.maxAsteroidsPerPlayer
    );
    PositionData memory targetPosition = PositionData({
      x: sourcePosition.x - targetPositionRelative.x,
      y: sourcePosition.y - targetPositionRelative.y,
      parentEntity: 0
    });
    logPosition(targetPosition);
    return (targetPosition);
  }

  function findRaidableAsteroid(bytes32 asteroidEntity, bool common2) public returns (PositionData memory) {
    switchPrank(creator);
    P_GameConfig.setAsteroidChanceInv(1);
    P_GameConfigData memory config = P_GameConfig.get();
    if (common2) {
      P_AsteroidProbabilityConfig.set({
        common1: 100,
        common2: 0,
        eliteMicro: 0,
        eliteSmall: 0,
        eliteMedium: 0,
        eliteLarge: 0
      });
    } else {
      P_AsteroidProbabilityConfig.set({
        common1: 0,
        common2: 100,
        eliteMicro: 0,
        eliteSmall: 0,
        eliteMedium: 0,
        eliteLarge: 0
      });
    }
    PositionData memory sourcePosition = Position.get(asteroidEntity);
    bytes32 asteroidSeed;
    PositionData memory targetPosition;
    uint256 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      if (i == P_WormholeAsteroidConfig.getWormholeAsteroidSlot()) {
        i++;
        continue;
      }
      PositionData memory targetPositionRelative = LibAsteroid.getPosition(
        i,
        config.asteroidDistance,
        config.maxAsteroidsPerPlayer
      );
      targetPosition = PositionData(
        sourcePosition.x - targetPositionRelative.x,
        sourcePosition.y - targetPositionRelative.y,
        0
      );
      console.log("position %s: ", i);
      logPosition(targetPosition);

      asteroidSeed = keccak256(abi.encode(asteroidEntity, bytes32("asteroid"), targetPosition.x, targetPosition.y));
      found = LibAsteroid.isAsteroid(asteroidSeed, config.asteroidChanceInv, i);
      i++;
    }
    require(found, "uh oh, no asteroid found");
    vm.stopPrank();
    return (targetPosition);
  }

  function conquerAsteroid(address player, bytes32 sourceAsteroid, bytes32 targetAsteroid) internal returns (bytes32) {
    bytes32 playerEntity = addressToEntity(player);
    uint256 asteroidDefense = LibCombatAttributes.getDefense(targetAsteroid);
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShip = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 minutemanAttack = P_Unit.getAttack(minutemanEntity, 1);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    vm.startPrank(creator);
    LibColony.increaseMaxColonySlots(addressToEntity(player));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = (10 * asteroidDefense) / minutemanAttack + 1;
      else if (unitPrototypes[i] == colonyShip) unitCounts[i] = 1;
      else unitCounts[i] = 0;
    }
    setupCreateFleet(player, sourceAsteroid, unitCounts, resourceCounts);
    vm.startPrank(player);
    bytes32 fleetEntity = world.Primodium__createFleet(sourceAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, targetAsteroid);
    switchPrank(creator);
    FleetMovement.setArrivalTime(fleetEntity, block.timestamp);
    vm.warp(block.timestamp + 1);

    while (OwnedBy.get(targetAsteroid) != playerEntity) {
      switchPrank(player);
      world.Primodium__attack(fleetEntity, targetAsteroid);
      switchPrank(creator);
      CooldownEnd.set(fleetEntity, block.timestamp - 1);
    }
    vm.stopPrank();
    return fleetEntity;
  }

  function spawnPlayers(uint256 count) internal {
    for (uint256 i = 0; i < count; i++) {
      spawn(getUser());
    }
  }

  function spawnFleetWithUnit(bytes32 asteroidEntity, EUnit unit, uint256 count) internal returns (bytes32) {
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);
    address player = entityToAddress(playerEntity);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = count;
    }
    setupCreateFleet(player, asteroidEntity, unitCounts, resourceCounts);
    vm.startPrank(player);
    bytes32 fleetEntity = world.Primodium__createFleet(asteroidEntity, unitCounts, resourceCounts);
    vm.stopPrank();
    return fleetEntity;
  }
}
