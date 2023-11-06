import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums"; // Assuming EResource is imported this way
import { components } from "src/network/components";
import { Hex } from "viem";
import { MULTIPLIER_SCALE } from "./constants";

export function getRockDefense(rockEntity: Entity) {
  const player = components.OwnedBy.get(rockEntity)?.value as Hex | undefined;
  const units = components.Hangar.get(rockEntity);
  if (!player || !units) return { points: 0n, multiplier: 1n };

  let defensePoints = 0n;

  units.units.forEach((unit, i) => {
    const count = units.counts[i];
    const level = components.UnitLevel.getWithKeys({ entity: player, unit: unit as Hex })?.value ?? 0n;
    const unitInfo = components.P_Unit.getWithKeys({ entity: unit as Hex, level });
    if (unitInfo) {
      defensePoints += count * unitInfo.defense;
    }
  });

  let multiplier = 1n;
  if (components.Home.get(player as Entity)?.asteroid === rockEntity) {
    multiplier =
      (defensePoints *
        (components.ResourceCount.getWithKeys({ entity: player, resource: EResource.M_DefenseMultiplier })?.value ??
          0n)) /
      MULTIPLIER_SCALE;
  }

  if (components.Home.get(player as Entity)?.asteroid === rockEntity) {
    defensePoints +=
      components.ResourceCount.getWithKeys({ entity: player, resource: EResource.U_Defense })?.value ?? 0n;
    defensePoints +=
      (defensePoints *
        (components.ResourceCount.getWithKeys({ entity: player, resource: EResource.M_DefenseMultiplier })?.value ??
          0n)) /
      MULTIPLIER_SCALE;
  }

  return { points: defensePoints, multiplier };
}
