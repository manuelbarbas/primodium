// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { P_AsteroidProbabilityConfig, P_AsteroidProbabilityConfigData } from "codegen/index.sol";

import { EResource } from "src/Types.sol";
import { MainBasePrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";

import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";

contract LibRaidableAsteroidTest is PrimodiumTest {
  function testAsteroidProbabilityConfig() public {
    P_AsteroidProbabilityConfigData memory asteroidProb = P_AsteroidProbabilityConfig.get();
    assertEq(
      asteroidProb.common1 +
        asteroidProb.common2 +
        asteroidProb.eliteMicro +
        asteroidProb.eliteSmall +
        asteroidProb.eliteMedium +
        asteroidProb.eliteLarge,
      100,
      "Secondary asteroid probabilities do not add up to 100"
    );
  }
}
