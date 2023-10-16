// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { EObjectives } from "src/Types.sol";

contract ClaimObjectiveSystem is PrimodiumSystem {
  function claimObjective(EObjectives objective) public {
    hasCompledtedObjective.set(addressToEntity(_msgSender()), P_EnumToPrototype.get(ObjectiveKey, uint8(objective)));
  }
}
