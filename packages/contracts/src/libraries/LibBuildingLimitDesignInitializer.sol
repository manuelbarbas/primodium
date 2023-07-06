// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

import { MainBaseID, NodeID, MinerID, DebugNodeID, LithiumMinerID, BulletFactoryID, SiloID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";

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
    ignoreBuildLimitComponent.set(NodeID);
    ignoreBuildLimitComponent.set(DebugNodeID);

    buildingLimitComponent.set(uint256(1), 10000000);
    buildingLimitComponent.set(uint256(2), 10000005);
    buildingLimitComponent.set(uint256(3), 10000010);
    buildingLimitComponent.set(uint256(4), 10000015);
    buildingLimitComponent.set(uint256(5), 10000020);
    buildingLimitComponent.set(uint256(6), 10000025);
  }
}
