// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID } from "components/GameConfigComponent.sol";
import { P_WorldSpeedComponent, ID as P_WorldSpeedComponentID, SPEED_SCALE } from "components/P_WorldSpeedComponent.sol";
import { Dimensions, Coord, GameConfig } from "../types.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { ResourceValues } from "../types.sol";
import { PersonalPirate } from "../prototypes/PirateAsteroids.sol";

import "../prototypes.sol";

library LibInitWorld {
  uint32 constant BIGNUM = 1_294_967_295;

  function init(IWorld world) internal {
    // todo: make the universe the correct size
    GameConfig memory config = GameConfig({
      moveSpeed: 10000,
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 4
    });

    Dimensions memory maxRange = Dimensions(37, 25);
    DimensionsComponent(world.getComponent(DimensionsComponentID)).set(SingletonID, maxRange);
    GameConfigComponent(world.getComponent(GameConfigComponentID)).set(SingletonID, config);
    PositionComponent(world.getComponent(PositionComponentID)).set(
      MainBaseID,
      Coord(maxRange.x / 2, maxRange.y / 2, 0)
    );
    P_WorldSpeedComponent(world.getComponent(P_WorldSpeedComponentID)).set(SingletonID, SPEED_SCALE);
    initPersonalPirate(world);
  }

  function initPersonalPirate(IWorld world) internal {
    ResourceValues memory resourceValues;
    resourceValues.resources = new uint256[](11);
    resourceValues.values = new uint32[](11);

    resourceValues.resources[0] = IronResourceItemID;
    resourceValues.values[0] = BIGNUM;
    resourceValues.resources[1] = CopperResourceItemID;
    resourceValues.values[1] = BIGNUM;
    resourceValues.resources[2] = LithiumResourceItemID;
    resourceValues.values[2] = BIGNUM;
    resourceValues.resources[3] = SulfurResourceItemID;
    resourceValues.values[3] = BIGNUM;
    resourceValues.resources[4] = IronPlateCraftedItemID;
    resourceValues.values[4] = BIGNUM;
    resourceValues.resources[5] = AlloyCraftedItemID;
    resourceValues.values[5] = BIGNUM;
    resourceValues.resources[6] = PhotovoltaicCellCraftedItemID;
    resourceValues.values[6] = BIGNUM;
    resourceValues.resources[7] = TitaniumResourceItemID;
    resourceValues.values[7] = BIGNUM;
    resourceValues.resources[8] = PlatinumResourceItemID;
    resourceValues.values[8] = BIGNUM;
    resourceValues.resources[9] = IridiumResourceItemID;
    resourceValues.values[9] = BIGNUM;
    resourceValues.resources[10] = KimberliteResourceItemID;
    resourceValues.values[10] = BIGNUM;

    P_MaxResourceStorageComponent(world.getComponent(P_MaxResourceStorageComponentID)).set(
      PersonalPirate,
      resourceValues.resources
    );

    P_MaxStorageComponent maxStorageComponent = P_MaxStorageComponent(world.getComponent(P_MaxStorageComponentID));
    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      maxStorageComponent.set(
        LibEncode.hashKeyEntity(resourceValues.resources[i], PersonalPirate),
        resourceValues.values[i]
      );
    }
  }
}
