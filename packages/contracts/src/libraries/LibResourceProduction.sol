pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";

library LibResourceProduction {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateResourceProduction(IWorld world, uint256 entity, uint256 newResourceProductionRate) internal {
    MineComponent mineComponent = MineComponent(world.getComponent(MineComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    if (newResourceProductionRate <= 0) {
      lastClaimedAtComponent.remove(entity);
      mineComponent.remove(entity);
      return;
    }
    if (!lastClaimedAtComponent.has(entity)) lastClaimedAtComponent.set(entity, block.number);
    mineComponent.set(entity, newResourceProductionRate);
  }
}
