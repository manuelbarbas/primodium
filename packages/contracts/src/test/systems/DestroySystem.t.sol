// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

// systems
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BlueprintSystem, ID as BlueprintSystemID } from "../../systems/BlueprintSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";

// components
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "../../components/BuildingTilesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

import { Coord } from "../../types.sol";

contract DestroySystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 public buildingEntity;
  uint256 public playerEntity;

  BlueprintSystem public blueprintSystem;
  BuildSystem public buildSystem;
  DestroySystem public destroySystem;

  OwnedByComponent public ownedByComponent;
  BuildingTilesComponent public buildingTilesComponent;
  BuildingComponent public buildingComponent;
  BuildingLimitComponent public buildingLimitComponent;
  TileComponent public tileComponent;
  LastBuiltAtComponent public lastBuiltAtComponent;
  MainBaseInitializedComponent public mainBaseInitializedComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    blueprintSystem = BlueprintSystem(system(BlueprintSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    destroySystem = DestroySystem(system(DestroySystemID));

    // init components
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    buildingTilesComponent = BuildingTilesComponent(component(BuildingTilesComponentID));
    buildingComponent = BuildingComponent(component(BuildingComponentID));
    tileComponent = TileComponent(component(TileComponentID));
    lastBuiltAtComponent = LastBuiltAtComponent(component(LastBuiltAtComponentID));
    mainBaseInitializedComponent = MainBaseInitializedComponent(component(MainBaseInitializedComponentID));
    buildingLimitComponent = BuildingLimitComponent(component(BuildingLimitComponentID));

    // init other
    vm.startPrank(alice);
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(dummyBuilding, blueprint);
    bytes memory rawBuildingEntity = buildSystem.executeTyped(dummyBuilding, coord);
    buildingEntity = abi.decode(rawBuildingEntity, (uint256));
    playerEntity = addressToEntity(alice);

    vm.stopPrank();
  }

  function testDestroy() public prank(alice) {
    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntity);
    uint256 buildingLimit = buildingLimitComponent.getValue(playerEntity);
    uint256 playerBase = buildingComponent.getValue(buildingEntity);
    destroySystem.executeTyped(buildingEntity);

    for (uint256 i = 0; i < buildingTiles.length; i++) {
      assertFalse(ownedByComponent.has(buildingTiles[i]));
      assertFalse(tileComponent.has(buildingTiles[i]));
    }

    assertFalse(ownedByComponent.has(buildingEntity));
    assertFalse(tileComponent.has(buildingEntity));
    assertFalse(lastBuiltAtComponent.has(buildingEntity));
    assertFalse(buildingComponent.has(buildingEntity));
    assertEq(buildingLimitComponent.getValue(playerEntity), buildingLimit - 1);
    bool hasMainBase = buildingComponent.has(playerEntity);
    if (playerBase == buildingEntity) {
      assertTrue(hasMainBase);
    } else {
      assertFalse(hasMainBase);
    }
  }
}
