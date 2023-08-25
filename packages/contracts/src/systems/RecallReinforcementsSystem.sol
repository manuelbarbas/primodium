// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity } from "./internal/PrimodiumSystem.sol";

// libraries
import { LibReinforce } from "../libraries/LibReinforce.sol";

uint256 constant ID = uint256(keccak256("system.RecallReinforcements"));

contract RecallReinforcementsSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity) public returns (bytes memory) {
    return execute(abi.encode(rockEntity));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 rockEntity = abi.decode(args, (uint256));

    LibReinforce.recallReinforcements(world, addressToEntity(msg.sender), rockEntity);
    return abi.encode(rockEntity);
  }
}
