// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

import { MainBaseID } from "../prototypes.sol";

library LibMaxBuildingsDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    MaxBuildingsComponent maxBuildingsComponent = MaxBuildingsComponent(
      getAddressById(components, MaxBuildingsComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );

    ignoreBuildLimitComponent.set(MainBaseID);

    maxBuildingsComponent.set(uint256(1), 4);
    maxBuildingsComponent.set(uint256(2), 7);
    maxBuildingsComponent.set(uint256(3), 11);
    maxBuildingsComponent.set(uint256(4), 15);
    maxBuildingsComponent.set(uint256(5), 24);
    maxBuildingsComponent.set(uint256(6), 32);
  }
}
