// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity } from "solecs/utils.sol";

import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { LibResource } from "../libraries/LibResource.sol";

uint256 constant ID = uint256(keccak256("system.S_ClaimAllResources"));

contract S_ClaimAllResourcesSystem is PrimodiumSystem, IOnSubsystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    address playerAddress = abi.decode(args, (address));
    uint256 playerEntity = addressToEntity(playerAddress);

    LibResource.claimAllResources(world, playerEntity);

    return abi.encode(0);
  }

  function executeTyped(address playerAddress) public returns (bytes memory) {
    return execute(abi.encode(playerAddress));
  }
}
