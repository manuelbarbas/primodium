// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";

import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";

import { ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "../../components/MaxBuildingsComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "../../components/BlueprintComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "../../components/MaxStorageComponent.sol";
import { OccupiedPassiveResourceComponent, ID as OccupiedPassiveResourceComponentID } from "components/OccupiedPassiveResourceComponent.sol";
import { MaxPassiveComponent, ID as MaxPassiveComponentID } from "components/MaxPassiveComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
import { ElectricityPassiveResourceID } from "../../prototypes.sol";
import { BIGNUM } from "../../prototypes/Debug.sol";
//debug buildings
import "../../prototypes.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibBlueprint } from "../../libraries/LibBlueprint.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { ResourceValue, ResourceValues } from "../../types.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BuildSystem public buildSystem;

  OwnedByComponent public ownedByComponent;
  ChildrenComponent public childrenComponent;
  BuildingTypeComponent public buildingTypeComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    buildSystem = BuildSystem(system(BuildSystemID));

    // init components
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    childrenComponent = ChildrenComponent(component(ChildrenComponentID));
    buildingTypeComponent = BuildingTypeComponent(component(BuildingTypeComponentID));

    // init other
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testFailPassiveResourceRequirementNotMet() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, getCoord1(alice));
    vm.stopPrank();
  }

  function testPassiveResourceRequirement() public {
    vm.startPrank(alice);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      component(OccupiedPassiveResourceComponentID)
    );

    buildSystem.executeTyped(DebugPassiveProductionBuilding, getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, getCoord1(alice));
    assertEq(
      occupiedPassiveResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    vm.stopPrank();
  }

  function testPassiveResourceRequirementUpToMax() public {
    vm.startPrank(alice);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      component(OccupiedPassiveResourceComponentID)
    );

    buildSystem.executeTyped(DebugPassiveProductionBuilding, getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    Coord memory coord2 = getCoord2(alice);
    for (uint256 i = 0; i < 5; i++) {
      buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, coord2);
      assertEq(
        occupiedPassiveResourceComponent.getValue(
          LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))
        ),
        2 * (i + 1),
        "used up electricity is incorrect"
      );
      coord2.x++;
    }
    vm.stopPrank();
  }

  function testFailPassiveResourceRequirementMoreThenMax() public {
    vm.startPrank(alice);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0, parent: 0 }));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    int32 secondIncrement = 1;
    for (uint256 i = 0; i < 6; i++) {
      buildSystem.executeTyped(
        DebugSimpleBuildingPassiveResourceRequirement,
        Coord({ x: secondIncrement, y: 0, parent: 0 })
      );
      secondIncrement++;
    }

    vm.stopPrank();
  }

  function testDestroyPassiveProduction() public {
    vm.startPrank(alice);

    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    buildSystem.executeTyped(DebugPassiveProductionBuilding, getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    destroySystem.executeTyped(getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      0,
      "Electricity Storage should be 0"
    );
    vm.stopPrank();
  }

  function testDestroyPassiveResourceRequirement() public {
    vm.startPrank(alice);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      component(OccupiedPassiveResourceComponentID)
    );
    buildSystem.executeTyped(DebugPassiveProductionBuilding, getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, getCoord1(alice));
    assertEq(
      occupiedPassiveResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(getCoord1(alice));

    assertEq(
      occupiedPassiveResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))
      ),
      0,
      "used up electricity should be 2"
    );

    vm.stopPrank();
  }

  function testFailDestroyPassiveProductionWhenRequirementsWouldFail() public {
    vm.startPrank(alice);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(component(MaxPassiveComponentID));
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      component(OccupiedPassiveResourceComponentID)
    );
    buildSystem.executeTyped(DebugPassiveProductionBuilding, getOrigin(alice));
    assertEq(
      maxPassiveComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, getCoord1(alice));
    assertEq(
      occupiedPassiveResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(getOrigin(alice));
    vm.stopPrank();
  }

  function testBuildMainBase() public {
    vm.startPrank(alice);

    Coord memory coord = getOrigin(alice);

    bytes memory rawBuildingEntity = buildSystem.executeTyped(MainBaseID, coord);

    uint256 buildingEntity = abi.decode(rawBuildingEntity, (uint256));

    Coord memory position = PositionComponent(component(PositionComponentID)).getValue(buildingEntity);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(buildingEntity));
    assertEq(ownedByComponent.getValue(buildingEntity), addressToEntity(alice));

    vm.stopPrank();
  }

  function testBuildLargeBuilding() public prank(deployer) {
    BlueprintComponent blueprintComponent = BlueprintComponent(component(BlueprintComponentID));
    int32[] memory blueprint = LibBlueprint.get3x3Blueprint();
    blueprintComponent.set(MainBaseID, blueprint);
    bytes memory rawBuildingEntity = buildSystem.executeTyped(MainBaseID, getOrigin(deployer));
    uint256 buildingEntity = abi.decode(rawBuildingEntity, (uint256));

    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    Coord memory position = positionComponent.getValue(buildingEntity);

    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    assertEq(blueprint.length, children.length * 2);

    for (uint i = 0; i < children.length; i++) {
      position = positionComponent.getValue(children[i]);
      assertCoordEq(position, Coord(blueprint[i * 2], blueprint[i * 2 + 1], 0));
      assertEq(buildingEntity, ownedByComponent.getValue(children[i]));
    }
  }

  function testFailMineBeforeBase() public {
    vm.startPrank(alice);

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = getNonIronCoord(alice);
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testFailIronMineOnNonIron() public {
    vm.startPrank(alice);

    //build main base
    buildMainBaseAtZero(alice);

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = getNonIronCoord(alice);
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");
    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));

    componentDevSystem.executeTyped(MaxBuildingsComponentID, 1, abi.encode(BIGNUM));

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceReqs() public {
    vm.startPrank(alice);

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    buildMainBaseAtZero(alice);

    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );

    uint256 debugLevel1 = LibEncode.hashKeyEntity(DebugSimpleBuildingResourceReqsID, 1);
    assertTrue(
      requiredResourcesComponent.has(debugLevel1),
      "DebugSimpleBuildingResourceReqs Level 1 should have resource requirements"
    );
    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(debugLevel1);
    assertEq(
      requiredResources.resources.length,
      1,
      "DebugSimpleBuildingResourceReqs should have 1 resource requirement"
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      console.log(
        "DebugSimpleBuildingResourceReqs requires resource: %s of amount %s",
        requiredResources.resources[i],
        requiredResources.values[i]
      );

      componentDevSystem.executeTyped(
        ItemComponentID,
        LibEncode.hashKeyEntity(requiredResources.resources[i], addressToEntity(alice)),
        abi.encode(requiredResources.values[i])
      );
    }
    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory ironCoord = getIronCoord(alice);
    bytes memory buildingEntity = buildSystem.executeTyped(DebugSimpleBuildingResourceReqsID, ironCoord);

    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));

    Coord memory position = PositionComponent(component(PositionComponentID)).getValue(buildingEntityID);
    assertCoordEq(position, ironCoord);

    assertTrue(ownedByComponent.has(buildingEntityID));
    assertEq(ownedByComponent.getValue(buildingEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public prank(alice) {
    buildMainBaseAtZero(alice);
    Coord memory coord = getCoord1(alice);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
  }

  function testFailBuildTwiceMainBase() public {
    vm.startPrank(alice);

    Coord memory coord1 = getOrigin(alice);
    Coord memory coord2 = getCoord1(alice);

    buildSystem.executeTyped(MainBaseID, coord1);
    buildSystem.executeTyped(MainBaseID, coord2);
    vm.stopPrank();
  }

  function testFailBuildMoreThanBuildLimit() public {
    vm.startPrank(alice);
    buildMainBaseAtZero(alice);
    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);
    int32 secondIncrement = 0;
    for (uint256 i = 0; i < buildLimit + 1; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1, parent: 0 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimit() public prank(alice) {
    buildMainBaseAtZero(alice);
    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1, parent: 0 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndBuildingWithIgnoreLimit() public {
    vm.startPrank(alice);

    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);

    Coord memory coord1 = getCoord1(alice);
    buildSystem.executeTyped(MainBaseID, coord1);

    coord1 = getCoord2(alice);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord1);

    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      coord1 = Coord({ x: secondIncrement, y: secondIncrement, parent: 0 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }
}
