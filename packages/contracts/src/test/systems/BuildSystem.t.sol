// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";

import { DestroySystem, ID as DestroySystemID } from "../../systems/DestroySystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";

import { ChildrenComponent, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BlueprintSystem, ID as BlueprintSystemID } from "../../systems/BlueprintSystem.sol";

import { DebugAcquireResourcesSystem, ID as DebugAcquireResourcesSystemID } from "../../systems/DebugAcquireResourcesSystem.sol";
import { DebugIgnoreBuildLimitForBuildingSystem, ID as DebugIgnoreBuildLimitForBuildingSystemID } from "../../systems/DebugIgnoreBuildLimitForBuildingSystem.sol";
import { DebugRemoveBuildLimitSystem, ID as DebugRemoveBuildLimitSystemID } from "../../systems/DebugRemoveBuildLimitSystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "../../components/BlueprintComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "../../components/ChildrenComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "../../components/MaxBuildingsComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../../components/BuildingTypeComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "../../components/MaxStorageComponent.sol";

import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";
import { ElectricityPassiveResourceID } from "../../prototypes.sol";

//debug buildings
import "../../prototypes.sol";
import "../../libraries/LibDebugInitializer.sol";
import { Coord } from "../../types.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BlueprintSystem public blueprintSystem;
  BuildSystem public buildSystem;

  OwnedByComponent public ownedByComponent;
  ChildrenComponent public childrenComponent;
  BuildingTypeComponent public buildingTypeComponent;

  function setUp() public override {
    super.setUp();

    // init systems
    blueprintSystem = BlueprintSystem(system(BlueprintSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));

    // init components
    ownedByComponent = OwnedByComponent(component(OwnedByComponentID));
    childrenComponent = ChildrenComponent(component(ChildrenComponentID));
    buildingTypeComponent = BuildingTypeComponent(component(BuildingTypeComponentID));

    // init other
  }

  function testFailPassiveResourceRequirementNotMet() public {
    vm.startPrank(alice);

    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: 1, y: 0 }));
    vm.stopPrank();
  }

  function testPassiveResourceRequirement() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      2,
      "used up electricity should be 2"
    );
    vm.stopPrank();
  }

  function testPassiveResourceRequirementUpToMax() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    int32 secondIncrement = 1;
    for (uint256 i = 0; i < 5; i++) {
      buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: secondIncrement, y: 0 }));
      assertEq(
        itemComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
        2 * (i + 1),
        "used up electricity is incorrect"
      );
      secondIncrement++;
    }

    vm.stopPrank();
  }

  function testFailPassiveResourceRequirementMoreThenMax() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));

    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    int32 secondIncrement = 1;
    for (uint256 i = 0; i < 6; i++) {
      buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: secondIncrement, y: 0 }));
      secondIncrement++;
    }

    vm.stopPrank();
  }

  function testDestroyPassiveProduction() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));

    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    destroySystem.executeTyped(Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      0,
      "Electricity Storage should be 0"
    );
    vm.stopPrank();
  }

  function testDestroyPassiveResourceRequirement() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      2,
      "used up electricity should be 2"
    );
    DestroySystem destroySystem = DestroySystem(system(DestroySystemID));
    destroySystem.executeTyped(Coord({ x: 1, y: 0 }));

    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      0,
      "used up electricity should be 2"
    );

    vm.stopPrank();
  }

  function testFailDestroyPassiveProductionWhenRequirementsWouldFail() public {
    vm.startPrank(alice);
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(component(MaxStorageComponentID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    buildSystem.executeTyped(DebugPassiveProductionBuilding, Coord({ x: 0, y: 0 }));
    assertEq(
      maxStorageComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingPassiveResourceRequirement, Coord({ x: 1, y: 0 }));
    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(ElectricityPassiveResourceID, addressToEntity(alice))),
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
    BlueprintComponent(component(BlueprintComponentID)).remove(MainBaseID);
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(MainBaseID, blueprint);
    bytes memory rawBuildingEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 buildingEntity = abi.decode(rawBuildingEntity, (uint256));
    Coord memory position = LibEncode.decodeCoordEntity(buildingEntity);

    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    assertEq(blueprint.length, children.length);

    for (uint i = 0; i < children.length; i++) {
      position = LibEncode.decodeCoordEntity(children[i]);
      assertCoordEq(position, blueprint[i]);
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

    DebugRemoveBuildLimitSystem debugRemoveBuildLimitSystem = DebugRemoveBuildLimitSystem(
      system(DebugRemoveBuildLimitSystemID)
    );
    debugRemoveBuildLimitSystem.executeTyped();

    buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceReqs() public {
    vm.startPrank(alice);

    DebugAcquireResourcesSystem debugAcquireResourcesSystem = DebugAcquireResourcesSystem(
      system(DebugAcquireResourcesSystemID)
    );

    buildMainBaseAtZero();

    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );

    assertTrue(
      requiredResourcesComponent.has(DebugSimpleBuildingResourceReqsID),
      "DebugSimpleBuildingResourceReqs should have resource requirements"
    );
    uint256[] memory resourceRequirements = requiredResourcesComponent.getValue(DebugSimpleBuildingResourceReqsID);
    assertEq(resourceRequirements.length, 1, "DebugSimpleBuildingResourceReqs should have 1 resource requirement");
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint32 resourceCost = LibMath.getSafeUint32Value(
        itemComponent,
        LibEncode.hashKeyEntity(resourceRequirements[i], DebugSimpleBuildingResourceReqsID)
      );
      console.log(
        "DebugSimpleBuildingResourceReqs requires resource: %s of amount %s",
        resourceRequirements[i],
        resourceCost
      );
      debugAcquireResourcesSystem.executeTyped(resourceRequirements[i], resourceCost);
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
    uint256 buildLimit = LibBuilding.getBuildingCountLimit(world, 1);
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
    uint256 buildLimit = LibBuilding.getBuildingCountLimit(world, 1);
    int32 secondIncrement = 0;
    for (uint256 i; i < buildLimit; i++) {
      Coord memory coord1 = Coord({ x: secondIncrement + 1, y: secondIncrement + 1 });
      buildSystem.executeTyped(DebugSimpleBuildingBuildLimitReq, coord1);
      secondIncrement++;
    }
  }

  function testBuildUpToBuildLimitIgnoreMainBaseAndBuildingWithIgnoreLimit() public {
    vm.startPrank(alice);

    uint256 buildLimit = LibBuilding.getBuildingCountLimit(world, 1);

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
