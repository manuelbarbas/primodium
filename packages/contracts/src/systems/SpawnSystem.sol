// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem } from "./internal/PrimodiumSystem.sol";

import { Player, Position, PositionData, Level } from "codegen/Tables.sol";
import { LibAsteroid, LibEncode } from "libraries/Libraries.sol";

contract SpawnSystem is PrimodiumSystem {
  function spawn() public returns (bytes32) {
    bytes32 playerEntity = LibEncode.addressToEntity(_msgSender());

    bool spawned = Player.get(playerEntity);
    require(!spawned, "[SpawnSystem] Player already spawned");

    bytes32 asteroid = LibAsteroid.createAsteroid(_world(), playerEntity);

    Level.set(playerEntity, 1);

    return asteroid;
  }
}
