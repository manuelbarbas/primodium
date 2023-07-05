// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { Coord } from "../types.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

uint256 constant ID = uint256(keccak256("system.Blueprint"));

contract BlueprintSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 buildingType, Coord[] memory blueprint) = abi.decode(args, (uint256, Coord[]));

    int32[] memory blueprintArray = new int32[](blueprint.length * 2);
    for (uint256 i = 0; i < blueprint.length; i++) {
      blueprintArray[i] = blueprint[i].x;
      blueprintArray[i + 1] = blueprint[i].y;
    }
    createBlueprint(buildingType, blueprintArray);
    return new bytes(0);
  }

  function executeTyped(uint256 buildingType, Coord[] memory blueprint) public returns (bytes memory) {
    return execute(abi.encode(buildingType, blueprint));
  }

  function executeTyped(uint256 buildingType, int32[] memory blueprint) public returns (bytes memory) {
    createBlueprint(buildingType, blueprint);
    return new bytes(0);
  }

  function createBlueprint(uint256 buildingType, int32[] memory blueprint) private {
    require(blueprint.length % 2 == 0, "blueprint: odd number of values");
    BlueprintComponent(getAddressById(components, BlueprintComponentID)).set(buildingType, blueprint);
  }
}
