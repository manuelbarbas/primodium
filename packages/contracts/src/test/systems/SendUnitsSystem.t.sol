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
//components
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

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

contract SendUnitsTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  PositionComponent public positionComponent;
  P_IsUnitComponent public isUnitComponent;
  GameConfigComponent public gameConfigComponent;
  OwnedByComponent public ownedByComponent;
  UnitsComponent public unitsComponent;
  ComponentDevSystem public componentDevSystem;
  OccupiedUtilityResourceComponent public occupiedUtilityResourceComponent;

  SendUnitsSystem public sendUnitsSystem;
  TrainUnitsSystem public trainUnitsSystem;
  BuildSystem public buildSystem;
  InvadeSystem public invadeSystem;
  RaidSystem public raidSystem;
  ReceiveReinforcementSystem public receiveReinforcementSystem;
  RecallReinforcementsSystem public recallReinforcementsSystem;

  function setUp() public override {
    super.setUp();

    positionComponent = PositionComponent(component(PositionComponentID));
    raidSystem = RaidSystem(system(RaidSystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    invadeSystem = InvadeSystem(system(InvadeSystemID));
    receiveReinforcementSystem = ReceiveReinforcementSystem(system(ReceiveReinforcementSystemID));
    recallReinforcementsSystem = RecallReinforcementsSystem(system(RecallReinforcementsSystemID));

    occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );
    unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
    isUnitComponent = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID));
    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
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

  function testFailSendUnitsCountZero() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 0);

    vm.expectRevert(bytes("unit count must be positive"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
  }

  function testFailSendTooFewUnits() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("not enough value to subtract"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
  }

  function testFailMustSendFromYourAsteroid() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("you can only move from an asteroid you own"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(deployer),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
  }

  function testFailSameRock() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("origin and destination cannot be the same"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(alice),
      addressToEntity(bob)
    );
  }

  function testFailInvadeSameTo() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("you cannot invade yourself"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(alice)
    );
  }

  // todo: check motherlode movement rules

  function setupAttackerUnits(address playerAddress, uint256 entity) internal {
    vm.startPrank(playerAddress);
    vm.roll(0);
    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(playerAddress)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(playerAddress));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, entity, 10);
    vm.stopPrank();
  }

  function testInvade() public {
    invade(alice, false);
  }

  function reinforce(address reinforcer, address receiver) public returns (Arrival memory) {
    setupAttackerUnits(receiver, DebugUnit);

    setupAttackerUnits(reinforcer, DebugUnit);

    vm.startPrank(reinforcer);
    vm.roll(100);
    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? 4 : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.REINFORCE,
      getHomeAsteroid(reinforcer),
      getHomeAsteroid(receiver),
      addressToEntity(receiver)
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));

    uint256 expectedArrivalBlock = calculateArrivalBlock(reinforcer, receiver, arrival);
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.REINFORCE,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(reinforcer),
      to: addressToEntity(receiver),
      origin: getHomeAsteroidEntity(reinforcer),
      destination: getHomeAsteroidEntity(receiver)
    });
    assertEq(arrival, expectedArrival);
    console.log("checking arrival list length");
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(receiver), getHomeAsteroidEntity(receiver))),
      1
    );
    console.log(
      "checking arrival list length success: %s",
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(receiver), getHomeAsteroidEntity(receiver)))
    );
    vm.stopPrank();
    return arrival;
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
    setupAttackerUnits(invader, DebugUnit);
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

    setupAttackerUnits(raider, DebugUnit);
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

  // Arrival resolution

  function testArrivalTooSoon() public {
    Arrival memory arrival = raid(alice);
    vm.roll(arrival.arrivalBlock - 1);
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(alice), getHomeAsteroidEntity(bob));
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      1
    );
  }

  function testArrivalExecuted() public {
    Arrival memory arrival = raid(alice);
    vm.roll(arrival.arrivalBlock);
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(alice), getHomeAsteroidEntity(bob));
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      0
    );
  }

  // testTwoArrivals
  function testOneArrivedOneDidntYet() public {
    Arrival memory arrival = raid(alice);
    vm.roll(block.number + 10);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 5);

    vm.startPrank(alice);
    sendUnitsSystem.executeTyped(
      units,
      ESendType.RAID,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
    vm.roll(arrival.arrivalBlock);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(alice), arrival.destination);

    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      1
    );
  }

  function testArrivalSnuckInBehind() public {
    setupAttackerUnits(alice, DebugUnit);
    vm.startPrank(alice);
    uint256 unitProductionBuildingEntityID = LibEncode.hashKeyCoord(BuildingKey, getIronCoord(alice));
    uint256 total = 1000;
    componentDevSystem.executeTyped(
      MaxUtilityComponentID,
      LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice)),
      abi.encode(total)
    );

    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit3, 10);
    vm.roll(block.number + 1000);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 1);

    Arrival memory slowArrival = abi.decode(
      sendUnitsSystem.executeTyped(
        units,
        ESendType.INVADE,
        getHomeAsteroid(alice),
        getHomeAsteroid(bob),
        addressToEntity(bob)
      ),
      (Arrival)
    );
    units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit3, 1);

    Arrival memory arrival2 = abi.decode(
      sendUnitsSystem.executeTyped(
        units,
        ESendType.INVADE,
        getHomeAsteroid(alice),
        getHomeAsteroid(bob),
        addressToEntity(bob)
      ),
      (Arrival)
    );
    vm.roll(arrival2.arrivalBlock);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(alice), arrival2.destination);
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      1
    );
    assertEq(
      ArrivalsList.get(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob)), 0),
      slowArrival
    );
  }

  function testExecuteInvade() public {
    Arrival memory invasionArrival = invade(alice, false);

    vm.roll(invasionArrival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    invadeSystem.executeTyped(invasionArrival.destination);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), invasionArrival.destination)),
      0
    );
    assertEq(ownedByComponent.getValue(invasionArrival.destination), addressToEntity(alice));
  }

  function testExecuteInvadeNeutral() public {
    Arrival memory invasionArrival = invade(alice, true);

    vm.roll(invasionArrival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    invadeSystem.executeTyped(invasionArrival.destination);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), invasionArrival.destination)),
      0
    );
    assertEq(ownedByComponent.getValue(invasionArrival.destination), addressToEntity(alice));
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

  function testExecuteReinforce() public {
    Arrival memory reinforceArrival = reinforce(alice, bob);
    console.log("reinforcer : %s , receiver : %s ", addressToEntity(alice), addressToEntity(bob));
    assertEq(
      LibMath.getSafe(
        unitsComponent,
        LibEncode.hashEntities(DebugUnit, addressToEntity(alice), getHomeAsteroidEntity(alice))
      ),
      6,
      "reinforcer must have 6 units on their home asteroid"
    );
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice))
      ),
      10,
      "alice must have occuppied 10 Housing"
    );
    console.log("checking trained units suceess");
    vm.roll(reinforceArrival.arrivalBlock);

    console.log("check if reinforcements arrival has been added");
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), reinforceArrival.destination)),
      1
    );
    console.log("execute receive reinforcements");
    vm.startPrank(bob);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    receiveReinforcementSystem.executeTyped(reinforceArrival.destination, 0);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    console.log("receive reinforcements sucess");
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), reinforceArrival.destination)),
      0
    );
    uint256 unitReceiverSpaceRockEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(bob),
      reinforceArrival.destination
    );
    assertEq(
      unitsComponent.getValue(unitReceiverSpaceRockEntity),
      14,
      "bob should have 14 units after receiving reinforcements"
    );
    assertEq(
      ownedByComponent.getValue(reinforceArrival.destination),
      addressToEntity(bob),
      "bob should own their asteroid after receiving reinforcements"
    );
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice))
      ),
      6,
      "alice must have occuppied 6 Housing after 4 of their units was received by bob"
    );
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(bob))
      ),
      14,
      "bob must have occuppied 14 Housing after receiving 4 of units from bob"
    );
    vm.stopPrank();
  }

  function testExecuteRecallReinforce() public {
    Arrival memory reinforceArrival = reinforce(alice, bob);
    console.log("reinforcer : %s , receiver : %s ", addressToEntity(alice), addressToEntity(bob));
    assertEq(
      LibMath.getSafe(
        unitsComponent,
        LibEncode.hashEntities(DebugUnit, addressToEntity(alice), getHomeAsteroidEntity(alice))
      ),
      6,
      "reinforcer must have 6 units on their home asteroid"
    );
    console.log(
      "alice has available housing : %s",
      LibUtilityResource.getAvailableUtilityCapacity(world, addressToEntity(alice), HousingUtilityResourceID)
    );
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice))
      ),
      10,
      "alice must have occuppied 10 Housing"
    );
    console.log("checking trained units suceess");
    vm.roll(reinforceArrival.arrivalBlock);

    console.log("check if reinforcements arrival has been added");
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), reinforceArrival.destination)),
      1
    );
    console.log("execute recall reinforcements");
    vm.startPrank(alice);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    recallReinforcementsSystem.executeTyped(reinforceArrival.destination);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    console.log("recall reinforcements sucess");
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), reinforceArrival.destination)),
      0
    );
    uint256 unitReceiverSpaceRockEntity = LibEncode.hashEntities(
      DebugUnit,
      addressToEntity(bob),
      reinforceArrival.destination
    );
    unitReceiverSpaceRockEntity = LibEncode.hashEntities(DebugUnit, addressToEntity(alice), reinforceArrival.origin);
    assertEq(
      LibMath.getSafe(
        unitsComponent,
        LibEncode.hashEntities(DebugUnit, addressToEntity(alice), getHomeAsteroidEntity(alice))
      ),
      10,
      "alice should have 10 units after recalling reinforcements"
    );
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice))
      ),
      10,
      "alice must have occuppied 10 Housing"
    );
    assertEq(
      ownedByComponent.getValue(reinforceArrival.destination),
      addressToEntity(bob),
      "bob should own their asteroid after receiving reinforcements"
    );
    vm.stopPrank();
  }
}
