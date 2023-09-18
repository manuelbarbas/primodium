// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { SendUnitsSystem, ID as SendUnitsSystemID } from "systems/SendUnitsSystem.sol";
import { TrainUnitsSystem, ID as TrainUnitsSystemID } from "systems/TrainUnitsSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "systems/BuildSystem.sol";
import { InvadeSystem, ID as InvadeSystemID } from "systems/InvadeSystem.sol";
import { RaidSystem, ID as RaidSystemID } from "systems/RaidSystem.sol";
import { ReceiveReinforcementSystem, ID as ReceiveReinforcementSystemID } from "systems/ReceiveReinforcementSystem.sol";
import { RecallReinforcementsSystem, ID as RecallReinforcementsSystemID } from "systems/RecallReinforcementsSystem.sol";
import { RecallUnitsFromMotherlodeSystem, ID as RecallUnitsFromMotherlodeSystemID } from "systems/RecallUnitsFromMotherlodeSystem.sol";
import { ClaimObjectiveSystem, ID as ClaimObjectiveSystemID } from "systems/ClaimObjectiveSystem.sol";
//components
import { P_UnitRequirementComponent, ID as P_UnitRequirementComponentID } from "components/P_UnitRequirementComponent.sol";
import { HasCompletedObjectiveComponent, ID as HasCompletedObjectiveComponentID } from "components/HasCompletedObjectiveComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibSend } from "libraries/LibSend.sol";
import { LibArrival } from "libraries/LibArrival.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibUtilityResource } from "libraries/LibUtilityResource.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";

contract ClaimObjectiveSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  PositionComponent public positionComponent;
  P_IsUnitComponent public isUnitComponent;
  GameConfigComponent public gameConfigComponent;
  OwnedByComponent public ownedByComponent;
  UnitsComponent public unitsComponent;
  OccupiedUtilityResourceComponent public occupiedUtilityResourceComponent;
  HasCompletedObjectiveComponent public hasCompletedObjectiveComponent;

  ComponentDevSystem public componentDevSystem;
  ClaimObjectiveSystem public claimObjectiveSystem;
  SendUnitsSystem public sendUnitsSystem;
  TrainUnitsSystem public trainUnitsSystem;
  BuildSystem public buildSystem;
  InvadeSystem public invadeSystem;
  RaidSystem public raidSystem;
  ReceiveReinforcementSystem public receiveReinforcementSystem;
  RecallReinforcementsSystem public recallReinforcementsSystem;
  RecallUnitsFromMotherlodeSystem public recallUnitsFromMotherlodeSystem;

  function setUp() public override {
    super.setUp();

    positionComponent = PositionComponent(component(PositionComponentID));
    raidSystem = RaidSystem(system(RaidSystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    invadeSystem = InvadeSystem(system(InvadeSystemID));
    claimObjectiveSystem = ClaimObjectiveSystem(system(ClaimObjectiveSystemID));
    receiveReinforcementSystem = ReceiveReinforcementSystem(system(ReceiveReinforcementSystemID));
    recallReinforcementsSystem = RecallReinforcementsSystem(system(RecallReinforcementsSystemID));
    recallUnitsFromMotherlodeSystem = RecallUnitsFromMotherlodeSystem(system(RecallUnitsFromMotherlodeSystemID));
    occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );
    unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
    isUnitComponent = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID));
    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    hasCompletedObjectiveComponent = HasCompletedObjectiveComponent(
      world.getComponent(HasCompletedObjectiveComponentID)
    );
    spawn(alice);
    spawn(bob);
    spawn(deployer);

    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = GameConfig({
      moveSpeed: 100,
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 6
    });
    vm.prank(deployer);
    gameConfigComponent.set(SingletonID, gameConfig);

    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(alice), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(bob), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(deployer), abi.encode(100));
  }

  function testFailClaimObjectiveNotRegistered() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugUnit, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugUnit);
  }

  function testFailClaimObjectiveTwice() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
  }

  function testClaimObjective() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveHasUnits() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID))
      .getValue(DebugHaveUnitsObjectiveID);

    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      setupUnits(alice, resourceValues.resources[i], resourceValues.values[i]);
    }

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveUnitsObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveHasUnits() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    ).getValue(DebugHaveUnitsObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "no resources required for objective");

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveUnitsObjectiveID);
  }

  function testClaimObjectiveResources() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    ).getValue(DebugHavResourcesObjectiveID);

    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      vm.prank(alice);
      componentDevSystem.executeTyped(
        ItemComponentID,
        LibEncode.hashKeyEntity(resourceValues.resources[i], addressToEntity(alice)),
        abi.encode(resourceValues.values[i])
      );
    }
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHavResourcesObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveResources() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHavResourcesObjectiveID);
  }

  // todo: check motherlode movement rules

  function setupUnits(address playerAddress, uint256 unitType, uint32 count) internal {
    vm.startPrank(playerAddress);
    vm.roll(0);
    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(playerAddress)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(playerAddress));

    vm.roll(block.number + 10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, unitType, count);
    vm.roll(block.number + 20);
    vm.stopPrank();
  }

  function testInvade() public {
    invade(alice, false);
  }

  function calculateArrivalBlock(address from, address to, Arrival memory arrival) public view returns (uint256) {
    //TODO can modify to use the actual speed of the slowest unit
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(from), DebugUnit);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(DebugUnit, playerUnitTypeLevel);
    uint32 speed = P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(
      unitTypeLevelEntity
    );
    Coord memory originPosition = getHomeAsteroid(from);
    Coord memory destinationPosition = getHomeAsteroid(to);
    uint256 worldSpeed = GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * worldSpeed) / 100 / 100);
    return expectedArrivalBlock;
  }

  function findMotherlode(address player) public returns (uint256) {
    GameConfig memory config = gameConfigComponent.getValue(SingletonID);

    vm.startPrank(deployer);
    uint256 asteroid = getHomeAsteroidEntity(player);
    Coord memory sourcePosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(asteroid);
    Coord memory targetPositionRelative = LibMotherlode.getCoord(
      0,
      config.motherlodeDistance,
      config.motherlodeChanceInv
    );
    Coord memory targetPosition = Coord(
      sourcePosition.x + targetPositionRelative.x,
      sourcePosition.y + targetPositionRelative.y,
      0
    );
    uint256 motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
    uint32 i = 0;
    bool found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
    while (i < 6 && !found) {
      i++;
      targetPositionRelative = LibMotherlode.getCoord(i, config.motherlodeDistance, config.motherlodeChanceInv);
      targetPosition = Coord(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
    }
    require(found, "uh oh, no motherlode found");
    LibMotherlode.initMotherlode(world, targetPosition, asteroid);
    vm.stopPrank();
    return (asteroid);
  }

  function invade(address invader, bool isNeutral) public returns (Arrival memory) {
    uint256 motherlodeEntity = findMotherlode(bob);

    if (!isNeutral) {
      vm.startPrank(deployer);
      ownedByComponent.set(motherlodeEntity, addressToEntity(bob));
      vm.stopPrank();
    }
    setupUnits(invader, DebugUnit, 10);
    vm.startPrank(invader);
    uint32 attackNumber = 4;
    vm.roll(100);

    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? attackNumber : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      positionComponent.getValue(motherlodeEntity),
      addressToEntity(bob)
    );

    Arrival memory arrival = abi.decode(rawArrival, (Arrival));

    uint256 speed = getPlayerUnitSpeed(world, invader, DebugUnit) *
      GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    Coord memory originPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(alice)
    );
    Coord memory destinationPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      motherlodeEntity
    );
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed) / 100 / 100);
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.INVADE,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(alice),
      to: addressToEntity(bob),
      origin: getHomeAsteroidEntity(alice),
      destination: motherlodeEntity
    });
    assertEq(arrival, expectedArrival);

    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), motherlodeEntity)), 1);
    vm.stopPrank();
    return arrival;
  }

  function getPlayerUnitSpeed(IWorld world, address player, uint256 unitType) public view returns (uint32) {
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(player), unitType);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(unitType, playerUnitTypeLevel);
    return P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(unitTypeLevelEntity);
  }

  function raid(address raider) public returns (Arrival memory) {
    vm.startPrank(bob);
    componentDevSystem.executeTyped(
      ItemComponentID,
      LibEncode.hashKeyEntity(IronID, addressToEntity(bob)),
      abi.encode(1000)
    );
    vm.stopPrank();

    setupUnits(raider, DebugUnit, 10);
    vm.startPrank(raider);
    uint32 attackNumber = 4;
    vm.roll(100);

    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? attackNumber : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.RAID,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(raider), DebugUnit);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(DebugUnit, playerUnitTypeLevel);
    uint32 speed = P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(
      unitTypeLevelEntity
    );
    Coord memory originPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(alice)
    );
    Coord memory destinationPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(bob)
    );

    uint256 worldSpeed = GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * worldSpeed) / 100 / 100);
    uint256 origin = positionComponent.getValue(addressToEntity(alice)).parent;
    uint256 destination = positionComponent.getValue(addressToEntity(bob)).parent;
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.RAID,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(alice),
      to: addressToEntity(bob),
      origin: origin,
      destination: destination
    });
    assertEq(arrival, expectedArrival);

    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      1
    );
    vm.stopPrank();
    return arrival;
  }

  function testExecuteRaid() public {
    Arrival memory raidArival = raid(alice);
    vm.roll(raidArival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    raidSystem.executeTyped(raidArival.destination);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), raidArival.destination)), 0);
    assertEq(ownedByComponent.getValue(raidArival.destination), addressToEntity(bob));
  }
}
