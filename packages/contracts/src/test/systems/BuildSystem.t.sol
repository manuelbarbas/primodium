// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";

import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";

import { ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "../../components/P_MaxBuildingsComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "../../components/P_BlueprintComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../../components/P_MaxStorageComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
import { ElectricityUtilityResourceID } from "../../prototypes.sol";
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

  function testFailUnregisteredBuildingType() public {
    vm.startPrank(alice);
    buildSystem.executeTyped(uint256(12), Coord({ x: 1, y: 0 }));
    vm.stopPrank();
  }

  function testFailUtilityResourceRequirementNotMet() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: 1, y: 0 }));
    vm.stopPrank();
  }

  function testUtilityResourceRequirement() public {
    vm.startPrank(alice);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );

    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    vm.stopPrank();
  }

  function testUtilityResourceRequirementUpToMax() public {
    vm.startPrank(alice);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );

    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    int32 secondIncrement = 1;
    for (uint256 i = 0; i < 5; i++) {
      buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: secondIncrement, y: 0 }));
      assertEq(
        occupiedUtilityResourceComponent.getValue(
          LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
        ),
        2 * (i + 1),
        "used up electricity is incorrect"
      );
      secondIncrement++;
    }

    vm.stopPrank();
  }

  function testFailUtilityResourceRequirementMoreThenMax() public {
    vm.startPrank(alice);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    int32 secondIncrement = 1;
    for (uint256 i = 0; i < 6; i++) {
      buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: secondIncrement, y: 0 }));
      secondIncrement++;
    }

    vm.stopPrank();
  }

  function testDestroyUtilityProduction() public {
    vm.startPrank(alice);

    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    destroySystem.executeTyped(Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      0,
      "Electricity Storage should be 0"
    );
    vm.stopPrank();
  }

  function testDestroyUtilityResourceRequirement() public {
    vm.startPrank(alice);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );
    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(Coord({ x: 1, y: 0 }));

    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
      ),
      0,
      "used up electricity should be 2"
    );

    vm.stopPrank();
  }

  function testFailDestroyUtilityProductionWhenRequirementsWouldFail() public {
    vm.startPrank(alice);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );
    buildSystem.executeTyped(DebugUtilityProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(Coord({ x: 0, y: 0 }));
    vm.stopPrank();
  }

  function testBuildMainBase() public {
    vm.startPrank(alice);

    Coord memory coord = Coord({ x: 0, y: 0 });

    bytes memory buildingEntity = buildSystem.executeTyped(MainBaseID, coord);

    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(buildingEntityID);
    assertEq(position.x, coord.x);
    assertEq(position.y, coord.y);

    assertTrue(ownedByComponent.has(buildingEntityID));
    assertEq(ownedByComponent.getValue(buildingEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testBuildLargeBuilding() public prank(deployer) {
    P_BlueprintComponent blueprintComponent = P_BlueprintComponent(component(P_BlueprintComponentID));
    int32[] memory blueprint = LibBlueprint.get3x3Blueprint();
    blueprintComponent.set(MainBaseID, blueprint);
    bytes memory rawBuildingEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 buildingEntity = abi.decode(rawBuildingEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(buildingEntity);

    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    assertEq(blueprint.length, children.length * 2);

    for (uint i = 0; i < children.length; i++) {
      position = LibEncode.decodeCoordEntity(children[i]);
      assertCoordEq(position, Coord(blueprint[i * 2], blueprint[i * 2 + 1]));
      assertEq(buildingEntity, ownedByComponent.getValue(children[i]));
    }
  }

  function testFailMineBeforeBase() public {
    vm.startPrank(alice);

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = Coord({ x: -6, y: 2 });
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testFailIronMineOnNonIron() public {
    vm.startPrank(alice);

    //build main base
    buildMainBaseAtZero();

    // TEMP: tile -6, 2 does not have iron according to current generation seed
    Coord memory nonIronCoord = Coord({ x: -6, y: 2 });
    assertTrue(LibTerrain.getTopLayerKey(nonIronCoord) != IronID, "Tile should not have iron");
    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));

    componentDevSystem.executeTyped(P_MaxBuildingsComponentID, 1, abi.encode(BIGNUM));

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceReqs() public {
    vm.startPrank(alice);

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    buildMainBaseAtZero();

    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      component(P_RequiredResourcesComponentID)
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
    Coord memory ironCoord = Coord({ x: -5, y: 2 });
    bytes memory buildingEntity = buildSystem.executeTyped(DebugSimpleBuildingResourceReqsID, ironCoord);

    uint256 buildingEntityID = abi.decode(buildingEntity, (uint256));

    Coord memory position = LibEncode.decodeCoordEntity(buildingEntityID);
    assertCoordEq(position, ironCoord);

    assertTrue(ownedByComponent.has(buildingEntityID));
    assertEq(ownedByComponent.getValue(buildingEntityID), addressToEntity(alice));

    vm.stopPrank();
  }

  function testFailBuildTwiceSameCoord() public prank(alice) {
    buildMainBaseAtZero();
    Coord memory coord = Coord({ x: 1, y: 1 });
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
  }

  function testFailBuildTwiceMainBase() public {
    vm.startPrank(alice);

    Coord memory coord1 = Coord({ x: 0, y: 0 });
    Coord memory coord2 = Coord({ x: 0, y: 1 });

    buildSystem.executeTyped(MainBaseID, coord1);
    buildSystem.executeTyped(MainBaseID, coord2);
    vm.stopPrank();
  }

  function testFailBuildMoreThenBuildLimit() public {
    vm.startPrank(alice);
    buildMainBaseAtZero();
    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);
    int32 secondIncrement = 0;
    for (uint256 i = 0; i < buildLimit + 1; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function testBuildUpToBuildLimit() public prank(alice) {
    buildMainBaseAtZero();
    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndBuildingWithIgnoreLimit() public {
    vm.startPrank(alice);

    uint256 buildLimit = LibBuilding.getMaxBuildingCount(world, 1);

    Coord memory coord1 = Coord({ x: -1, y: -1 });
    buildSystem.executeTyped(MainBaseID, coord1);

    coord1 = Coord({ x: 1, y: 2 });
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord1);

    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      coord1 = Coord({ x: secondIncrement, y: secondIncrement });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
    vm.stopPrank();
  }

  function buildMainBaseAtZero() internal returns (uint256) {
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    return blockEntityID;
  }
}
