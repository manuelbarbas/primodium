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
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "../../components/BuildingTilesComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { TileComponent, ID as TileComponentID } from "../../components/TileComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

import { Coord } from "../../types.sol";
import { MainBaseID } from "../../prototypes.sol";

contract DestroySystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 public playerEntity;

  BlueprintSystem public blueprintSystem;
  BuildSystem public buildSystem;
  DestroySystem public destroySystem;

  OwnedByComponent public ownedByComponent;
  BlueprintComponent public blueprintComponent;
  BuildingTilesComponent public buildingTilesComponent;
  LevelComponent public levelComponent;
  MaxBuildingsComponent public maxBuildingsComponent;
  TileComponent public tileComponent;
  MainBaseInitializedComponent public mainBaseInitializedComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    blueprintSystem = BlueprintSystem(system(BlueprintSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    destroySystem = DestroySystem(system(DestroySystemID));

    // init components
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    blueprintComponent = BlueprintComponent(component(BlueprintComponentID));
    buildingTilesComponent = BuildingTilesComponent(component(BuildingTilesComponentID));
    levelComponent = LevelComponent(component(LevelComponentID));
    tileComponent = TileComponent(component(TileComponentID));
    mainBaseInitializedComponent = MainBaseInitializedComponent(component(MainBaseInitializedComponentID));
    maxBuildingsComponent = MaxBuildingsComponent(component(MaxBuildingsComponentID));

    // init other
    vm.startPrank(alice);
    playerEntity = addressToEntity(alice);
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    vm.stopPrank();
  }

  function buildDummy() public returns (uint256) {
    vm.startPrank(alice);
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(dummyBuilding, blueprint);
    bytes memory rawBuilding = buildSystem.executeTyped(dummyBuilding, coord1);
    return abi.decode(rawBuilding, (uint256));
  }

  function destroy(uint256 buildingEntity, Coord memory _coord) public {
    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntity);
    uint256 maxBuildings = maxBuildingsComponent.getValue(playerEntity);
    destroySystem.executeTyped(_coord);

    for (uint256 i = 0; i < buildingTiles.length; i++) {
      assertFalse(ownedByComponent.has(buildingTiles[i]));
      assertFalse(tileComponent.has(buildingTiles[i]));
    }

    assertFalse(ownedByComponent.has(buildingEntity), "has ownedby");
    assertFalse(tileComponent.has(buildingEntity), "has tile");
    assertFalse(levelComponent.has(buildingEntity), "has level");
    assertEq(maxBuildingsComponent.getValue(playerEntity), maxBuildings - 1, "wrong limit");
  }

  function testDestroyWithTile() public {
    uint256 buildingEntity = buildDummy();
    Coord[] memory blueprint = makeBlueprint();
    destroy(buildingEntity, blueprint[blueprint.length - 1]);
  }

  function testDestroyWithBase() public {
    uint256 buildingEntity = buildDummy();
    destroy(buildingEntity, coord1);
  }
}
