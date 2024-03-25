// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetRaid } from "libraries/fleet/LibFleetRaid.sol";

contract S_BattleRaidResolveSystem is PrimodiumSystem {
  function battleRaidResolve(bytes32 battleEntity, bytes32 raider, bytes32 target) public {
    LibFleetRaid.battleRaidResolve(battleEntity, raider, target);
  }
}
