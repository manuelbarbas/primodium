// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { LibUnit } from "libraries/LibUnit.sol";
import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";
import { LibResource } from "libraries/LibResource.sol";

contract S_ClaimSystem is System {
  function claimUnits(bytes32 asteroidEntity) public {
    LibUnit.claimUnits(asteroidEntity);
    LibRaidableAsteroid.claimRaidableUnits(asteroidEntity);
  }

  function claimResources(bytes32 asteroidEntity) public {
    LibResource.claimAllResources(asteroidEntity);
  }
}
