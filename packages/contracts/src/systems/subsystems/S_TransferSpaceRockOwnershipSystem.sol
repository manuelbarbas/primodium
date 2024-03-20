// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy } from "src/codegen/index.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { ColoniesMap } from "libraries/ColoniesMap.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { FleetOwnedByKey, AsteroidOwnedByKey } from "src/Keys.sol";

contract S_TransferSpaceRockOwnershipSystem is PrimodiumSystem {
  function transferSpaceRockOwnership(bytes32 spaceRock, bytes32 newOwner) public {
    bytes32 lastOwner = OwnedBy.get(spaceRock);
    if (lastOwner != bytes32(0)) {
      //clear defending fleets
      LibFleetStance.clearDefendingFleets(spaceRock);
      //disband all fleets
      disbandAllFleets(spaceRock);

      ColoniesMap.remove(lastOwner, AsteroidOwnedByKey, spaceRock);
    }
    OwnedBy.set(spaceRock, newOwner);
    ColoniesMap.add(newOwner, AsteroidOwnedByKey, spaceRock);
  }

  function disbandAllFleets(bytes32 spaceRock) internal {
    bytes32[] memory ownedFleets = FleetsMap.getFleetIds(spaceRock, FleetOwnedByKey);
    for (uint256 i = 0; i < ownedFleets.length; i++) {
      LibFleetDisband.disbandFleet(ownedFleets[i]);

      IWorld world = IWorld(_world());
      world.Primodium__resetFleetIfNoUnitsLeft(ownedFleets[i]);
    }
  }
}
