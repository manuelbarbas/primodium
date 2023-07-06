// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { BlueprintComponent as Blueprint, ID as BlueprintID } from "components/BlueprintComponent.sol";

import { LibBlueprint } from "libraries/LibBlueprint.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Blueprint"));

contract BlueprintSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  /**
   * @dev Executes the blueprint creation by decoding the arguments and calling the createBlueprint function.
   * @param args The encoded arguments containing the building type and blueprint coordinates.
   * @return Empty bytes.
   */
  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord[] memory blueprint) = abi.decode(args, (uint256, Coord[]));

    int32[] memory blueprintArray = new int32[](blueprint.length * 2);
    for (uint256 i = 0; i < blueprint.length; i++) {
      blueprintArray[i * 2] = blueprint[i].x;
      blueprintArray[i * 2 + 1] = blueprint[i].y;
    }
    LibBlueprint.createBlueprint(Blueprint(getC(BlueprintID)), buildingType, blueprintArray);
    return new bytes(0);
  }

  /**
   * @dev Executes the blueprint creation using typed parameters.
   * @param buildingType The type of building for the blueprint.
   * @param blueprint The blueprint coordinates.
   * @return Empty bytes.
   */
  function executeTyped(uint256 buildingType, Coord[] memory blueprint) public returns (bytes memory) {
    return execute(abi.encode(buildingType, blueprint));
  }

  /**
   * @dev Executes the blueprint creation using an array of integers.
   * @param buildingType The type of building for the blueprint.
   * @param blueprint The blueprint coordinates as an array of integers.
   * @return Empty bytes.
   */
  function executeTyped(uint256 buildingType, int32[] memory blueprint) public returns (bytes memory) {
    LibBlueprint.createBlueprint(Blueprint(getC(BlueprintID)), buildingType, blueprint);
    return new bytes(0);
  }
}
