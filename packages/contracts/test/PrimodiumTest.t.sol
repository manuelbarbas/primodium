// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceAccess, NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";

import "src/utils.sol";
import { RESERVE_CURRENCY, RESERVE_CURRENCY_RESOURCE } from "src/constants.sol";
import "codegen/world/IWorld.sol";
import "codegen/index.sol";
import "src/Types.sol";
import "codegen/Prototypes.sol";
import "codegen/Libraries.sol";
import "src/Keys.sol";
import "src/Types.sol";

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
  uint8 U_MaxMoves = uint8(EResource.U_MaxMoves);
  uint8 Kimberlite = uint8(EResource.Kimberlite);
  uint8 Lithium = uint8(EResource.Lithium);
  uint8 Titanium = uint8(EResource.Titanium);

  function setUp() public virtual override {
    super.setUp();
    world = IWorld(worldAddress);
    creator = world.creator();

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startPrank(creator);
    ResourceAccess.set(ROOT_NAMESPACE_ID, creator, true);
    NamespaceOwner.set(ROOT_NAMESPACE_ID, creator);
    vm.stopPrank();

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
    assertEq(coordA.parent, coordB.parent, "[assertEq]: parent doesn't match");
  }

  function assertEq(EResource a, EResource b) internal {
    assertEq(uint256(a), uint256(b));
  }

  function logPosition(PositionData memory coord) internal view {
    console.log("x");
    console.logInt(coord.x);
    console.log("y");
    console.logInt(coord.y);
    console.log("parent", uint256(coord.parent));
  }

  function getHomeAsteroidPosition(address player) public view returns (PositionData memory) {
    bytes32 asteroid = Home.get(addressToEntity(player));
    return Position.get(asteroid);
  }

  function getMainBasePosition(address player) internal view returns (PositionData memory) {
    PositionData memory position = Position.get(MainBasePrototypeId);
    return getPosition(PositionData2D(position.x, position.y), player);
  }

  function getPosition1(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord1 = PositionData2D(15, 12);
    return getPosition(coord1, player);
  }

  function getPosition2(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord2 = PositionData2D(23, 17);
    return getPosition(coord2, player);
  }

  function getPosition3(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord3 = PositionData2D(13, 8);
    return getPosition(coord3, player);
  }

  function getIronPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 8);
    return getPosition(coord, player);
  }

  function getIronPosition2(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(21, 8);
    return getPosition(coord, player);
  }

  function getCopperPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 15);
    return getPosition(coord, player);
  }

  function getNonIronPosition(address player) internal pure returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(8, 15);
    return getPosition(coord, player);
  }

  function getTilePosition(bytes32 asteroidEntity, EResource resource) internal view returns (PositionData memory) {
    uint8 mapId = Asteroid.getMapId(asteroidEntity);
    console.log("map id:, ", mapId);
    Bounds memory bounds = LibBuilding.getSpaceRockBounds(asteroidEntity);
    console.log("x bounds: %s, %s", uint32(bounds.minX), uint32(bounds.maxX));
    console.log("y bounds: %s, %s", uint32(bounds.minY), uint32(bounds.maxY));
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        uint8 foundResource = P_Terrain.get(mapId, i, j);
        if (foundResource == uint8(resource)) {
          return PositionData(i, j, asteroidEntity);
        }
      }
    }
    revert("Resource not found");
  }

  function getPosition(int32 x, int32 y, address player) internal pure returns (PositionData memory coord) {
    return getPosition(PositionData2D(x, y), player);
  }

  function getPosition(
    PositionData2D memory coord2D,
    address player
  ) internal pure returns (PositionData memory coord) {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 asteroid = LibEncode.getHash(playerEntity);

    coord = PositionData(coord2D.x, coord2D.y, asteroid);
  }

  function spawn(address player) internal returns (bytes32) {
    vm.prank(player);
    world.spawn();
    bytes32 playerEntity = addressToEntity(player);
    bytes32 homeRock = Home.get(playerEntity);
    return homeRock;
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

  function getUnitArray(uint256 unit1Count, uint256 unit2Count) internal view returns (uint256[] memory unitArray) {
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
    bytes32 spaceRock = Home.get(playerEntity);
    bytes32 mainBase = Home.get(spaceRock);
    P_RequiredResourcesData memory requiredResources = getTrainCost(unitPrototype, count);

    provideResources(spaceRock, requiredResources);
    trainUnits(player, mainBase, unitPrototype, count, fastForward);
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
    uint256 unitProdMultiplier = P_UnitProdMultiplier.get(buildingType, level);
    bytes32[] memory newProdTypes = new bytes32[](1);
    newProdTypes[0] = unitPrototype;

    P_UnitProdTypes.set(buildingType, level, newProdTypes);
    P_UnitProdMultiplier.set(buildingType, level, 100);
    if (!UnitFactorySet.has(Position.getParent(buildingEntity), buildingEntity))
      UnitFactorySet.add(Position.getParent(buildingEntity), buildingEntity);

    vm.stopPrank();

    vm.startPrank(player);
    world.trainUnits(buildingEntity, unitPrototype, count);
    if (fastForward) vm.warp(block.timestamp + (LibUnit.getUnitBuildTime(buildingEntity, unitPrototype) * count));
    vm.stopPrank();

    vm.startPrank(creator);
    P_UnitProdTypes.set(buildingType, level, prodTypes);
    vm.stopPrank();
  }

  function upgradeMainBase(address player) internal returns (uint256) {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 spaceRock = Home.get(playerEntity);
    bytes32 mainBase = Home.get(spaceRock);
    P_RequiredResourcesData memory requiredResources = getUpgradeCost(mainBase);
    provideResources(spaceRock, requiredResources);
    upgradeBuilding(player, mainBase);
  }

  function upgradeMainBase(address player, uint256 level) internal returns (uint256) {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 spaceRock = Home.get(playerEntity);
    bytes32 mainBase = Home.get(spaceRock);
    while (Level.get(mainBase) < level) {
      upgradeBuilding(player, mainBase);
    }
  }

  function upgradeBuilding(address player, bytes32 buildingEntity) internal {
    P_RequiredResourcesData memory requiredResources = getUpgradeCost(buildingEntity);
    provideResources(Position.get(buildingEntity).parent, requiredResources);
    uint256 requiredMainBaseLevel = P_RequiredBaseLevel.get(
      BuildingType.get(buildingEntity),
      Level.get(buildingEntity) + 1
    );
    upgradeMainBase(player, requiredMainBaseLevel);
    vm.startPrank(player);
    world.upgradeBuilding(Position.get(buildingEntity));
    vm.stopPrank();
  }

  function buildBuilding(address player, EBuilding building, PositionData memory position) internal {
    P_RequiredResourcesData memory requiredResources = getBuildCost(building);
    provideResources(position.parent, requiredResources);
    uint256 requiredMainBaseLevel = P_RequiredBaseLevel.get(P_EnumToPrototype.get(BuildingKey, uint8(building)), 1);
    upgradeMainBase(player, requiredMainBaseLevel);
    vm.startPrank(player);
    world.build(building, position);
    vm.stopPrank();
  }

  function provideMaxStorage(bytes32 spaceRock, P_RequiredResourcesData memory requiredResources) internal {
    vm.startPrank(creator);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i])) continue;
      if (MaxResourceCount.get(spaceRock, requiredResources.resources[i]) < requiredResources.amounts[i])
        LibStorage.increaseMaxStorage(
          spaceRock,
          requiredResources.resources[i],
          requiredResources.amounts[i] - MaxResourceCount.get(spaceRock, requiredResources.resources[i])
        );
    }
    vm.stopPrank();
  }

  function provideResources(bytes32 spaceRock, P_RequiredResourcesData memory requiredResources) internal {
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      increaseResource(spaceRock, EResource(requiredResources.resources[i]), requiredResources.amounts[i]);
    }
  }

  function claimResources(bytes32 spaceRock) internal {
    vm.startPrank(creator);
    world.claimResources(spaceRock);
    vm.stopPrank();
  }

  function increaseProduction(bytes32 spaceRock, EResource resource, uint256 amount) internal {
    vm.startPrank(creator);
    LibProduction.increaseResourceProduction(spaceRock, resource, amount);
    vm.stopPrank();
  }

  function increaseResource(bytes32 spaceRock, EResource resourceType, uint256 count) internal {
    vm.startPrank(creator);
    if (P_IsUtility.get(uint8(resourceType))) {
      LibProduction.increaseResourceProduction(spaceRock, resourceType, count);
    } else {
      if (MaxResourceCount.get(spaceRock, uint8(resourceType)) < count)
        LibStorage.increaseMaxStorage(
          spaceRock,
          uint8(resourceType),
          count - MaxResourceCount.get(spaceRock, uint8(resourceType))
        );
      LibStorage.increaseStoredResource(spaceRock, uint8(resourceType), count);
    }
    vm.stopPrank();
  }

  function getTrainCost(
    EUnit unitType,
    uint256 count
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unitType));
    requiredResources = getTrainCost(unitPrototype, count);
  }

  function getTrainCost(
    bytes32 unitPrototype,
    uint256 count
  ) internal view returns (P_RequiredResourcesData memory requiredResources) {
    requiredResources = P_RequiredResources.get(unitPrototype, count);
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
    bytes32 spaceRock,
    uint256[] memory unitCounts,
    uint256[] memory resourceCounts
  ) public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      trainUnits(player, unitPrototypes[i], unitCounts[i], true);
    }
    uint8[] memory transportables = P_Transportables.get();
    for (uint256 i = 0; i < transportables.length; i++) {
      increaseResource(spaceRock, EResource(transportables[i]), resourceCounts[i]);
    }
  }
}
