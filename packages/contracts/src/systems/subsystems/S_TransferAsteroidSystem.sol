// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy } from "src/codegen/index.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { ColoniesMap } from "libraries/ColoniesMap.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { FleetOwnedByKey, AsteroidOwnedByKey } from "src/Keys.sol";

contract S_TransferAsteroidSystem is PrimodiumSystem {
  function transferAsteroid(bytes32 asteroidEntity, bytes32 ownerEntity) public {
    bytes32 lastOwnerEntity = OwnedBy.get(asteroidEntity);
    if (lastOwnerEntity != bytes32(0)) {
      //clear defending fleets
      LibFleetStance.clearDefendingFleets(asteroidEntity);
      //disband all fleets
      disbandAllFleets(asteroidEntity);

      ColoniesMap.remove(lastOwnerEntity, AsteroidOwnedByKey, asteroidEntity);
    }
    OwnedBy.set(asteroidEntity, ownerEntity);
    ColoniesMap.add(ownerEntity, AsteroidOwnedByKey, asteroidEntity);
  }

  function disbandAllFleets(bytes32 asteroidEntity) internal {
    bytes32[] memory ownedFleets = FleetsMap.getFleetIds(asteroidEntity, FleetOwnedByKey);
    for (uint256 i = 0; i < ownedFleets.length; i++) {
      LibFleetDisband.disbandFleet(ownedFleets[i]);

      IWorld world = IWorld(_world());
      world.Primodium__resetFleetIfNoUnitsLeft(ownedFleets[i]);
    }
  }
}
