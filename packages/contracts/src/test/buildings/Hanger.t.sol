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
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../../components/LevelComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "../../components/MaxUtilityComponent.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import "../../prototypes.sol";

import { LibAsteroid } from "../../libraries/LibAsteroid.sol";
import { LibMath } from "../../libraries/LibMath.sol";

import { Coord, Dimensions } from "../../types.sol";

contract HangerTest is PrimodiumTest {
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

    ResourceValues memory utility = P_RequiredUtilityComponent(world.getComponent(P_RequiredUtilityComponentID))
      .getValue(buildingLevelEntity);
    /* -------------------------------- Utility -------------------------------- */
    for (uint256 i = 0; i < utility.resources.length; i++) {
      uint256 resource = utility.resources[i];
      uint256 amount = utility.values[i];
      componentDevSystem.executeTyped(
        MaxUtilityComponentID,
        LibEncode.hashKeyEntity(resource, playerEntity),
        abi.encode(amount)
      );
    }
  }

  function testBuildHanger() public returns (Coord memory) {
    vm.startPrank(alice);
    uint256 aliceEntity = addressToEntity(alice);

    uint256 entity = HangerID;
    uint32 level = 1;

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
    setupBuildingReqs(addressToEntity(alice), entity, level);
    buildSystem.executeTyped(entity, getCoord1(alice));

    return getCoord1(alice);
  }

  // testUpgradeHanger
  function testUpgradeHanger() public {
    Coord memory coord = testBuildHanger();
    uint256 entity = HangerID;
    uint32 level = 2;

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(entity, level);
    setupBuildingReqs(addressToEntity(alice), entity, level);

    upgradeBuildingSystem.executeTyped(coord);
  }

  // testDestroyHanger
  function testDestroyHanger() public {
    Coord memory coord = testBuildHanger();
    destroySystem.executeTyped(coord);
  }
}
