// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BattleResultComponent, ID as BattleResultComponentID, BattleResult } from "../components/BattleResultComponent.sol";
import { BattleAttackerComponent, ID as BattleAttackerComponentID } from "../components/BattleAttackerComponent.sol";
import { BattleDefenderComponent, ID as BattleDefenderComponentID } from "../components/BattleDefenderComponent.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibReward } from "../libraries/LibReward.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as ClaimObjectiveSystemID } from "./ClaimObjectiveSystem.sol";
uint256 constant ID = uint256(keccak256("system.S_ReceiveRewards"));

contract S_ReceiveRewardsSystem is PrimodiumSystem, IOnEntitySubsystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (address playerAddress, uint256 objectiveId) = abi.decode(args, (address, uint256));
    require(
      addressToEntity(msg.sender) == ClaimObjectiveSystemID,
      "[S_ReceiveRewardsSystem]: only ClaimObjectiveSystem can call this"
    );
    LibReward.receiveRewards(world, addressToEntity(playerAddress), objectiveId);

    return abi.encode(objectiveId);
  }

  function executeTyped(address playerAddress, uint256 battleEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, battleEntity));
  }
}
