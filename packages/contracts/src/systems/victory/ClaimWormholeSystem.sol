// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_GameConfig, BuildingType, OwnedBy, Position, P_WormholeConfig, Wormhole, CooldownEnd, P_ScoreMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibScore } from "libraries/LibScore.sol";
import { LibWormhole } from "libraries/LibWormhole.sol";
import { EScoreType } from "src/Types.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";

contract ClaimWormholeSystem is PrimodiumSystem {
  function wormholeDeposit(
    bytes32 wormholeBaseEntity,
    uint256 count
  ) public _claimResources(Position.getParentEntity(wormholeBaseEntity)) {
    bytes32 playerEntity = _player();
    bytes32 asteroidEntity = OwnedBy.get(wormholeBaseEntity);

    uint8 resource = LibWormhole.advanceTurn();
    require(
      BuildingType.get(wormholeBaseEntity) == WormholeBasePrototypeId,
      "[WormholeDeposit] Building is not a wormhole generator"
    );
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[WormholeDeposit] Only owner can deposit");
    require(CooldownEnd.get(wormholeBaseEntity) <= block.timestamp, "[WormholeDeposit] Wormhole in cooldown");

    LibStorage.checkedDecreaseStoredResource(asteroidEntity, resource, count);

    uint256 scoreIncrease = count * P_ScoreMultiplier.get(resource);
    LibScore.addScore(playerEntity, EScoreType.Wormhole, scoreIncrease);

    uint256 cooldownLength = (P_WormholeConfig.getCooldown() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    CooldownEnd.set(wormholeBaseEntity, block.timestamp + cooldownLength);

    Wormhole.setHash(
      keccak256(abi.encode(uint256(wormholeBaseEntity), count, block.timestamp, blockhash(block.number - 1)))
    );
  }
}
