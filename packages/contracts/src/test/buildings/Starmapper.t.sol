// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { SendUnitsSystem, ID as SendUnitsSystemID } from "systems/SendUnitsSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";

import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { P_MaxMovesComponent, ID as P_MaxMovesComponentID } from "components/P_MaxMovesComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../../components/LevelComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import "../../prototypes.sol";

import { LibAsteroid } from "../../libraries/LibAsteroid.sol";
import { LibMath } from "../../libraries/LibMath.sol";

import { Coord, Dimensions } from "../../types.sol";

contract StarmapperTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  PositionComponent public positionComponent;
  ComponentDevSystem public componentDevSystem;
  SendUnitsSystem public sendUnitsSystem;
  BuildSystem public buildSystem;
  UpgradeBuildingSystem public upgradeBuildingSystem;
  DestroySystem public destroySystem;

  function setUp() public override {
    super.setUp();
    spawn(alice);
    spawn(bob);
    spawn(deployer);

    positionComponent = PositionComponent(component(PositionComponentID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    destroySystem = DestroySystem(system(DestroySystemID));
  }

  // testFailSendNoStarmapper
  function testFailSendNoStarmapper() public {
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);
    vm.expectRevert(bytes("you have reached your max move count"));
    sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
  }

  function setupBuildingReqs(uint256 playerEntity, uint256 buildingType, uint256 level) public {
    /* -------------------------------- Research -------------------------------- */
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, level);

    uint256 mainBaseLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingLevelEntity);
    componentDevSystem.executeTyped(
      LevelComponentID,
      MainBaseComponent(world.getComponent(MainBaseComponentID)).getValue(playerEntity),
      abi.encode(mainBaseLevel)
    );

    if (P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).has(buildingLevelEntity)) {
      uint256 research = P_RequiredResearchComponent(world.getComponent(P_RequiredResearchComponentID)).getValue(
        buildingLevelEntity
      );

      componentDevSystem.executeTyped(
        HasResearchedComponentID,
        LibEncode.hashKeyEntity(research, playerEntity),
        abi.encode(true)
      );
    }

    ResourceValues memory resources = P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID))
      .getValue(buildingLevelEntity);
    /* -------------------------------- Resources ------------------------------- */
    for (uint256 i = 0; i < resources.resources.length; i++) {
      uint256 resource = resources.resources[i];
      uint256 amount = resources.values[i];
      componentDevSystem.executeTyped(
        ItemComponentID,
        LibEncode.hashKeyEntity(resource, playerEntity),
        abi.encode(amount)
      );
    }
  }

  function testBuildStarmapper() public returns (Coord memory) {
    vm.startPrank(alice);
    uint256 aliceEntity = addressToEntity(alice);

    uint256 entity = StarmapperID;
    uint32 level = 1;

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
    setupBuildingReqs(addressToEntity(alice), entity, level);
    buildSystem.executeTyped(entity, getCoord1(alice));

    uint32 moves = P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).getValue(buildingLevelEntity);
    assertEq(moves, MaxMovesComponent(world.getComponent(MaxMovesComponentID)).getValue(aliceEntity));

    uint256 origin = positionComponent.getValue(addressToEntity(alice)).parent;
    uint256 unitPlayerAsteroidEntity = LibEncode.hashEntities(DebugUnit, addressToEntity(alice), origin);

    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerAsteroidEntity, abi.encode(20));
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    Coord memory aliceHomeAsteroid = getHomeAsteroid(alice);
    Coord memory bobHomeAsteroid = getHomeAsteroid(bob);
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, aliceHomeAsteroid, bobHomeAsteroid, addressToEntity(bob));
    vm.expectRevert(bytes("you have reached your max move count"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, aliceHomeAsteroid, bobHomeAsteroid, addressToEntity(bob));
    return getCoord1(alice);
  }

  // testUpgradeStarmapper
  function testUpgradeStarmapper() public {
    Coord memory coord = testBuildStarmapper();
    uint256 entity = StarmapperID;
    uint32 level = 2;

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
    setupBuildingReqs(addressToEntity(alice), entity, level);

    upgradeBuildingSystem.executeTyped(coord);

    uint32 moves = P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).getValue(buildingLevelEntity);
    assertEq(moves, MaxMovesComponent(world.getComponent(MaxMovesComponentID)).getValue(addressToEntity(alice)));
  }

  // testDestroyStarmapper
  function testDestroyStarmapper() public {
    Coord memory coord = testBuildStarmapper();
    destroySystem.executeTyped(coord);

    assertEq(0, MaxMovesComponent(world.getComponent(MaxMovesComponentID)).getValue(addressToEntity(alice)));
  }
}
