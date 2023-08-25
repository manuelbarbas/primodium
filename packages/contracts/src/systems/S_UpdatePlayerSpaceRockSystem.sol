// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "systems/internal/PrimodiumSystem.sol";

import { ID as TrainUnitsSystemID } from "systems/TrainUnitsSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdatePlayerSpaceRock"));

contract S_UpdatePlayerSpaceRockSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (address playerAddress, uint256 spaceRockEntity) = abi.decode(args, (address, uint256));

    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    if (!ownedByComponent.has(spaceRockEntity)) return abi.encode(spaceRockEntity);

    uint256 playerEntity = ownedByComponent.getValue(spaceRockEntity);
    LibUpdateSpaceRock.updateSpaceRock(world, playerEntity, spaceRockEntity);
    console.log("update space rock finished");
  }

  function executeTyped(address playerAddress, uint256 spaceRockEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, spaceRockEntity));
  }
}
