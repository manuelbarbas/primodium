// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Position, PositionData, BuildingType, OwnedBy, Children, Spawned, Level, BuildingType } from "codegen/Tables.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { LibBuilding } from "codegen/Libraries.sol";

contract DestroySystem is PrimodiumSystem {
  function destroy(PositionData memory coord) public returns (bytes32 buildingEntity) {
    buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    bytes32 playerEntity = addressToEntity(msg.sender);
    bytes32 buildingType = BuildingType.get(buildingEntity);

    require(buildingType != MainBasePrototypeId, "[Destroy] Cannot destroy main base");
    require(OwnedBy.get(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    bytes32[] memory children = Children.get(buildingEntity);
    for (uint256 i = 0; i < children.length; i++) {
      clearBuildingTile(children[i]);
    }
    Children.deleteRecord(buildingEntity);

    // for main base tile, remove main base initialized.

    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Children.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);
  }

  function clearBuildingTile(bytes32 tileEntity) private {
    require(OwnedBy.get(tileEntity) != 0, "[Destroy] Cannot destroy unowned coordinate");
    OwnedBy.deleteRecord(tileEntity);
  }
}
