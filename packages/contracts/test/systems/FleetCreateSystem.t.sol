// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "test/PrimodiumTest.t.sol";

contract FleetCreateSystemTest is PrimodiumTest {
  bytes32 aliceHomeSpaceRock;

  function setUp() public override {
    super.setUp();
    aliceHomeSpaceRock = spawn(alice);
  }

  function testCreateFleet() public {
    trainUnits(alice, EUnit.MinutemanMarine, 1, true);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine))) unitCounts[i] = 1;
    }
    uint8[] memory transportables = new uint8[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](transportables.length);
    vm.startPrank(alice);
    world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
  }

  function trainUnits(
    address player,
    EUnit unitType,
    uint256 count,
    bool fastForward
  ) internal {
    bytes32 playerEntity = addressToEntity(player);
    bytes32 spaceRock = Home.get(playerEntity);
    bytes32 mainBase = Home.get(spaceRock);
    P_RequiredResourcesData memory requiredResources = getTrainCost(unitType, count);

    provideResources(spaceRock, requiredResources);
    trainUnits(player, mainBase, unitType, count, fastForward);
  }

  function trainUnits(
    address player,
    bytes32 buildingEntity,
    EUnit unitType,
    uint256 count,
    bool fastForward
  ) internal {
    vm.startPrank(creator);

    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unitType));

    bytes32[] memory prodTypes = P_UnitProdTypes.get(buildingType, level);
    uint256 unitProdMultiplier = P_UnitProdMultiplier.get(buildingType, level);
    bytes32[] memory newProdTypes = new bytes32[](1);
    newProdTypes[0] = unitPrototype;

    P_UnitProdTypes.set(buildingType, level, newProdTypes);
    P_UnitProdMultiplier.set(buildingType, level, 1);
    vm.stopPrank();

    vm.startPrank(player);
    world.trainUnits(buildingEntity, unitType, count);
    if (fastForward) vm.warp(block.timestamp + LibUnit.getUnitBuildTime(buildingEntity, unitPrototype) * count);
    vm.stopPrank();

    vm.startPrank(creator);
    P_UnitProdTypes.set(buildingType, level, prodTypes);
    P_UnitProdMultiplier.set(buildingType, level, unitProdMultiplier);
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
      P_RequiredResourcesData memory requiredResources = getUpgradeCost(mainBase);
      provideResources(spaceRock, requiredResources);
      upgradeBuilding(player, mainBase);
    }
  }

  function upgradeBuilding(address player, bytes32 buildingEntity) internal {
    vm.startPrank(player);
    world.upgradeBuilding(Position.get(buildingEntity));
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
    vm.startPrank(creator);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i])) {
        LibProduction.increaseResourceProduction(
          spaceRock,
          EResource(requiredResources.resources[i]),
          requiredResources.amounts[i]
        );
      } else {
        if (MaxResourceCount.get(spaceRock, requiredResources.resources[i]) < requiredResources.amounts[i])
          LibStorage.increaseMaxStorage(
            spaceRock,
            requiredResources.resources[i],
            requiredResources.amounts[i] - MaxResourceCount.get(spaceRock, requiredResources.resources[i])
          );
        LibStorage.increaseStoredResource(spaceRock, requiredResources.resources[i], requiredResources.amounts[i]);
      }
    }
    vm.stopPrank();
  }

  function getTrainCost(EUnit unitType, uint256 count)
    internal
    view
    returns (P_RequiredResourcesData memory requiredResources)
  {
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unitType));
    requiredResources = P_RequiredResources.get(unitPrototype, count);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      requiredResources.amounts[i] *= count;
    }
  }

  function getBuildCost(EBuilding buildingType)
    internal
    view
    returns (P_RequiredResourcesData memory requiredResources)
  {
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(buildingType));
    requiredResources = P_RequiredResources.get(buildingPrototype, 1);
  }

  function getUpgradeCost(bytes32 buildingEntity)
    internal
    view
    returns (P_RequiredResourcesData memory requiredResources)
  {
    uint256 level = Level.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    requiredResources = P_RequiredResources.get(buildingPrototype, level + 1);
  }
}
