import { EntityID } from "@latticexyz/recs";
import { BlockType } from "./constants";

export function isValidWeaponStorage(tileId: EntityID) {
  return (
    tileId == BlockType.Silo ||
    tileId == BlockType.ProjectileLauncher ||
    tileId == BlockType.MissileLaunchComplex
  );
}

export function isValidWeapon(keyId: EntityID) {
  return (
    keyId == BlockType.BulletCrafted ||
    keyId == BlockType.KineticMissileCrafted ||
    keyId == BlockType.PenetratingMissileCrafted ||
    keyId == BlockType.ThermobaricMissileCrafted
  );
}

export function getAttackRadius(tileId: EntityID) {
  if (tileId == BlockType.Silo) {
    return 10;
  } else if (tileId == BlockType.ProjectileLauncher) {
    return 30;
  } else if (tileId == BlockType.MissileLaunchComplex) {
    return 60;
  } else {
    return 0;
  }
}
