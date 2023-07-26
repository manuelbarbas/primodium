// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "../components/FactoryProductionComponent.sol";
import { MineComponent, ID as MineComponentID } from "../components/MineComponent.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibResourceProduction } from "./LibResourceProduction.sol";

library LibFactory {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateResourceProductionOnActiveChange(
    IWorld world,
    uint256 playerEntity,
    uint256 factoryLevelEntity,
    bool isFunctional
  ) internal {
    MineComponent mineComponent = MineComponent(world.getComponent(MineComponentID));
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      world.getComponent(FactoryProductionComponentID)
    );
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(factoryLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    uint32 newResourceProductionRate = isFunctional
      ? LibMath.getSafeUint32Value(mineComponent, playerResourceEntity) + factoryProductionData.ResourceProductionRate
      : LibMath.getSafeUint32Value(mineComponent, playerResourceEntity) - factoryProductionData.ResourceProductionRate;
    LibResourceProduction.updateResourceProduction(world, playerResourceEntity, newResourceProductionRate);
  }
}
