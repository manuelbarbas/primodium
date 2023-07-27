pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";

library LibResourceProduction {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateResourceProduction(IWorld world, uint256 entity, uint32 newResourceProductionRate) internal {
    MineProductionComponent mineProductionComponent = MineProductionComponent(
      world.getComponent(MineProductionComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    if (newResourceProductionRate <= 0) {
      lastClaimedAtComponent.remove(entity);
      mineProductionComponent.remove(entity);
      return;
    }
    if (!lastClaimedAtComponent.has(entity)) lastClaimedAtComponent.set(entity, block.number);
    mineProductionComponent.set(entity, newResourceProductionRate);
  }
}
