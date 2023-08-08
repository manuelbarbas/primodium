// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

import { Coord } from "../types.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
uint256 constant ID = uint256(keccak256("system.CheckRequiredTile"));

contract CheckRequiredTileSystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID),
      "CheckRequiredTileSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity, uint256 buildingType) = abi.decode(
      args,
      (address, uint256, uint256)
    );
    Coord memory position = PositionComponent(getC(PositionComponentID)).getValue(buildingEntity);

    return abi.encode(LibBuilding.canBuildOnTile(world, buildingType, position));
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    uint256 buildingType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, buildingType));
  }
}
