import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { UnitStorages } from "./constants";
import { entityToRockName } from "./name";
import { getUnitStats } from "./trainUnits";

export const getFleetStats = (fleet: Entity) => {
  const spaceRock = components.OwnedBy.get(fleet)?.value as Entity;
  if (!spaceRock) throw new Error("Fleet must be owned by a space rock");
  const ret = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

  [...UnitStorages].forEach((unit) => {
    const unitEntity = unit as Entity;
    const count = components.UnitCount.getWithKeys(
      { entity: fleet as Hex, unit: unitEntity as Hex },
      { value: 0n }
    )?.value;

    const unitData = getUnitStats(unitEntity as Entity, spaceRock);
    ret.attack += unitData.ATK * count;
    ret.defense += unitData.DEF * count;
    ret.hp += unitData.HP * count;
    ret.cargo += unitData.CRG * count;
    ret.decryption = bigIntMax(ret.decryption, unitData.DEC);
    ret.speed = bigIntMin(ret.speed == 0n ? BigInt(10e100) : ret.speed, unitData.SPD);
  });
  return { ...ret, title: entityToRockName(fleet) };
};
