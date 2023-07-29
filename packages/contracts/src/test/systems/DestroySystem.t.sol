// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

// systems
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { DebugSetBlueprintForBuildingTypeSystem, ID as DebugSetBlueprintForBuildingTypeSystemID } from "../../systems/DebugSetBlueprintForBuildingTypeSystem.sol";
// components
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

import { LibBlueprint } from "libraries/LibBlueprint.sol";
import { Coord } from "../../types.sol";
import { MainBaseID } from "../../prototypes.sol";
import { DebugSimpleBuildingNoReqsID } from "../../prototypes/Debug.sol";

contract DestroySystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 public playerEntity;

  DebugSetBlueprintForBuildingTypeSystem public debugSetBlueprintForBuildingTypeSystem;
  BuildSystem public buildSystem;
  DestroySystem public destroySystem;

  OwnedByComponent public ownedByComponent;
  BlueprintComponent public blueprintComponent;
  ChildrenComponent public childrenComponent;
  LevelComponent public levelComponent;
  MaxBuildingsComponent public maxBuildingsComponent;
  BuildingTypeComponent public buildingTypeComponent;
  MainBaseComponent public mainBaseComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    buildSystem = BuildSystem(system(BuildSystemID));
    destroySystem = DestroySystem(system(DestroySystemID));
    debugSetBlueprintForBuildingTypeSystem = DebugSetBlueprintForBuildingTypeSystem(
      system(DebugSetBlueprintForBuildingTypeSystemID)
    );
    // init components
    blueprintComponent = BlueprintComponent(component(BlueprintComponentID));
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    childrenComponent = ChildrenComponent(component(ChildrenComponentID));
    levelComponent = LevelComponent(component(LevelComponentID));
    buildingTypeComponent = BuildingTypeComponent(component(BuildingTypeComponentID));
    mainBaseComponent = MainBaseComponent(component(MainBaseComponentID));
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
    debugSetBlueprintForBuildingTypeSystem.executeTyped(dummyBuilding, makeBlueprint());
    bytes memory rawBuilding = buildSystem.executeTyped(dummyBuilding, coord1);
    return abi.decode(rawBuilding, (uint256));
  }

  function destroy(uint256 buildingEntity, Coord memory _coord) public {
    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    uint256 maxBuildings = maxBuildingsComponent.getValue(playerEntity);
    destroySystem.executeTyped(_coord);

    for (uint256 i = 0; i < children.length; i++) {
      assertFalse(ownedByComponent.has(children[i]));
      assertFalse(buildingTypeComponent.has(children[i]));
    }

    assertFalse(ownedByComponent.has(buildingEntity), "has ownedby");
    assertFalse(buildingTypeComponent.has(buildingEntity), "has tile");
    assertFalse(levelComponent.has(buildingEntity), "has level");
    assertEq(maxBuildingsComponent.getValue(playerEntity), maxBuildings - 1, "wrong limit");
  }

  function testDestroyWithTile() public {
    uint256 buildingEntity = buildDummy();
    int32[] memory blueprint = makeBlueprint();
    destroy(buildingEntity, Coord(blueprint[blueprint.length - 2], blueprint[blueprint.length - 1]));
  }

  function testDestroyWithBase() public {
    uint256 buildingEntity = buildDummy();
    destroy(buildingEntity, coord1);
  }
}
