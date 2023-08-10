// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

// systems
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
// components
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { LibBlueprint } from "libraries/LibBlueprint.sol";
import { Coord } from "../../types.sol";
import { MainBaseID } from "../../prototypes.sol";
import { DebugSimpleBuildingNoReqsID } from "../../prototypes/Debug.sol";

contract DestroySystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 public playerEntity;
  int32[] public blueprint = LibBlueprint.get2x2Blueprint();

  uint256 public dummyBuilding = uint256(bytes32("dummy"));

  ComponentDevSystem public componentDevSystem;
  BuildSystem public buildSystem;
  DestroySystem public destroySystem;

  OwnedByComponent public ownedByComponent;
  P_BlueprintComponent public blueprintComponent;
  ChildrenComponent public childrenComponent;
  LevelComponent public levelComponent;
  BuildingCountComponent public buildingCountComponent;
  BuildingTypeComponent public buildingTypeComponent;
  MainBaseComponent public mainBaseComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    buildSystem = BuildSystem(system(BuildSystemID));
    destroySystem = DestroySystem(system(DestroySystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    // init components
    blueprintComponent = P_BlueprintComponent(component(P_BlueprintComponentID));
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    childrenComponent = ChildrenComponent(component(ChildrenComponentID));
    levelComponent = LevelComponent(component(LevelComponentID));
    buildingTypeComponent = BuildingTypeComponent(component(BuildingTypeComponentID));
    mainBaseComponent = MainBaseComponent(component(MainBaseComponentID));
    buildingCountComponent = BuildingCountComponent(component(BuildingCountComponentID));

    // init other
    spawn(alice);
    vm.startPrank(alice);
    playerEntity = addressToEntity(alice);
    buildSystem.executeTyped(MainBaseID, getCoord2(alice));
    vm.stopPrank();
  }

  function buildDummy() private returns (uint256) {
    vm.startPrank(alice);
    componentDevSystem.executeTyped(P_BlueprintComponentID, dummyBuilding, abi.encode(blueprint));
    componentDevSystem.executeTyped(P_IsBuildingTypeComponentID, dummyBuilding, abi.encode(true));
    bytes memory rawBuilding = buildSystem.executeTyped(dummyBuilding, getOrigin(alice));
    return abi.decode(rawBuilding, (uint256));
  }

  function destroy(uint256 buildingEntity, Coord memory _coord) public {
    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    uint256 buildingCount = buildingCountComponent.getValue(playerEntity);
    destroySystem.executeTyped(_coord);

    for (uint256 i = 0; i < children.length; i++) {
      assertFalse(ownedByComponent.has(children[i]));
      assertFalse(buildingTypeComponent.has(children[i]));
    }

    assertFalse(ownedByComponent.has(buildingEntity), "has ownedby");
    assertFalse(buildingTypeComponent.has(buildingEntity), "has tile");
    assertFalse(levelComponent.has(buildingEntity), "has level");
    assertEq(buildingCountComponent.getValue(playerEntity), buildingCount - 1, "wrong limit");
  }

  function testDestroyWithBuildingOrigin() public {
    uint256 buildingEntity = buildDummy();
    destroy(buildingEntity, getOrigin(alice));
  }

  function testDestroyWithTile() public {
    uint256 buildingEntity = buildDummy();
    uint256 asteroid = PositionComponent(component(PositionComponentID)).getValue(addressToEntity(alice)).parent;
    destroy(buildingEntity, Coord(blueprint[2], blueprint[3], asteroid));
  }
}
