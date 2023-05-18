// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

// Production Buildings
import { SiloID } from "../prototypes/Tiles.sol";
import { BulletFactoryID, MissileLaunchComplexID } from "../prototypes/Tiles.sol";

import { BulletCraftedItemID } from "../prototypes/Keys.sol";
import { KineticMissileCraftedItemID, PenetratingMissileCraftedItemID, ThermobaricMissileCraftedItemID } from "../prototypes/Keys.sol";

library LibAttack {
  function isValidWeaponStorage(uint256 tileId) internal pure returns (bool) {
    return tileId == SiloID || tileId == MissileLaunchComplexID;
  }

  function isValidWeapon(uint256 keyId) internal pure returns (bool) {
    return
      keyId == BulletCraftedItemID ||
      keyId == KineticMissileCraftedItemID ||
      keyId == PenetratingMissileCraftedItemID ||
      keyId == ThermobaricMissileCraftedItemID;
  }

  function getAttackDamage(uint256 keyId) internal pure returns (uint256) {
    if (keyId == BulletCraftedItemID) {
      return 20;
    } else if (keyId == KineticMissileCraftedItemID) {
      return 100;
    } else if (keyId == PenetratingMissileCraftedItemID) {
      return 200;
    } else if (keyId == ThermobaricMissileCraftedItemID) {
      return 300;
    } else {
      return 0;
    }
  }

  function getAttackRadius(uint256 keyId) internal pure returns (int32) {
    if (keyId == BulletCraftedItemID) {
      return 5;
    } else if (keyId == KineticMissileCraftedItemID) {
      return 10;
    } else if (keyId == PenetratingMissileCraftedItemID) {
      return 15;
    } else if (keyId == ThermobaricMissileCraftedItemID) {
      return 20;
    } else {
      return 0;
    }
  }
}
