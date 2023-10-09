// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { P_EnumToPrototype, Position, PositionData, Spawned, Home } from "codegen/index.sol";

// libraries
import { LibEncode, LibBuilding, LibResource } from "codegen/Libraries.sol";

// types
import { BuildingKey } from "src/Keys.sol";
import { EBuilding } from "src/Types.sol";
import { bytes32ToString } from "src/utils.sol";
import "forge-std/console.sol";

contract BuildSystem is PrimodiumSystem {
  function build(EBuilding buildingType, PositionData memory coord) public returns (bytes32 buildingEntity) {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, uint8(buildingType));

    console.log("playerEntity: %s", bytes32ToString(playerEntity));
    return LibBuilding.build(playerEntity, buildingPrototype, coord);
  }
}
