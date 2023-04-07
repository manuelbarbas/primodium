// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibCraft {
  // craft bullet with 1 iron and 1 copper
  function craftBullet(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    Uint256Component bulletCraftedComponent,
    uint256 entity
  ) public {
    uint256 IRON_REQUIRED = 1;
    uint256 COPPER_REQUIRED = 1;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curBullets = bulletCraftedComponent.has(entity) ? bulletCraftedComponent.getValue(entity) : 0;

    uint256 maxBulletsFromIron = curIron / IRON_REQUIRED;
    uint256 maxBulletsFromCopper = curCopper / COPPER_REQUIRED;

    uint256 bullets = maxBulletsFromIron <= maxBulletsFromCopper ? maxBulletsFromIron : maxBulletsFromCopper;
    uint256 consumeIronBy = bullets * IRON_REQUIRED;
    uint256 consumeCopperBy = bullets * COPPER_REQUIRED;

    ironResourceComponent.set(entity, curIron - consumeIronBy);
    copperResourceComponent.set(entity, curCopper - consumeCopperBy);
    bulletCraftedComponent.set(entity, curBullets + bullets);
  }
}
