// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

library LibBuildingLimitDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(components, BuildingLimitComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );

    ignoreBuildLimitComponent.set(MainBaseID);

    buildingLimitComponent.set(uint256(1), 4);
    buildingLimitComponent.set(uint256(2), 7);
    buildingLimitComponent.set(uint256(3), 11);
    buildingLimitComponent.set(uint256(4), 15);
    buildingLimitComponent.set(uint256(5), 24);
    buildingLimitComponent.set(uint256(6), 32);
  }
}
