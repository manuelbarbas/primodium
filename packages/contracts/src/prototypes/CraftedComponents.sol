// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

// prevents stack too deep error
struct CraftedComponents {
  BulletCraftedComponent bulletCraftedComponent;
}
