// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";

import { BattleResultComponent, ID as BattleResultComponentID, BattleResult } from "../components/BattleResultComponent.sol";

import { LibBattle } from "../libraries/LibBattle.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.Battle"));

contract BattleSystem is PrimodiumSystem, IOnEntitySubsystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (address playerAddress, uint256 battleEntity) = abi.decode(args, (address, uint256));
    BattleResultComponent battleResultComponent = BattleResultComponent(getC(BattleResultComponentID));
    require(!battleResultComponent.has(battleEntity), "BattleSystem: battle already resolved");

    BattleResult memory battleResult = LibBattle.resolveBattle(world, battleEntity);
    battleResultComponent.set(battleEntity, battleResult);

    return abi.encode(battleEntity);
  }

  function executeTyped(address playerAddress, uint256 battleEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, battleEntity));
  }
}
