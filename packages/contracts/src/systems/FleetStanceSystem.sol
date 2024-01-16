// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetStanceSystem is PrimodiumSystem {
  function clearFleetStance(bytes32 fleetId) public {
    bytes32 playerEntity = _player();
    LibFleet.clearFleetStance(playerEntity, fleetId);
  }

  function setFleetStance(
    bytes32 fleetId,
    uint8 stance,
    bytes32 target
  ) internal {
    bytes32 playerEntity = _player();
    LibFleet.setFleetStance(playerEntity, fleetId, stance, target);
  }
}
