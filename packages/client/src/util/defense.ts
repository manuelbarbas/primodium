import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums"; // Assuming EResource is imported this way
import { components } from "src/network/components";
import { Account } from "src/network/components/clientComponents"; // Assuming Account is imported this way
import { Hex } from "viem";
import { MULTIPLIER_SCALE } from "./constants";

export function getRockDefense(rockEntity: Entity, defenderEntity?: Entity): bigint {
  const player = (defenderEntity ?? Account.get()?.value) as Hex;
  const unitPrototypes = (components.P_UnitPrototypes.get()?.value as Hex[]) ?? [];
  let defensePoints = 0n;

  for (let i = 0; i < unitPrototypes.length; i++) {
    const defenderUnitCount =
      components.UnitCount.getWithKeys({ player, rock: rockEntity as Hex, unit: unitPrototypes[i] })?.value ?? 0n;
    const defenderLevel = components.UnitLevel.getWithKeys({ entity: player, unit: unitPrototypes[i] })?.value ?? 0n;

    const unitInfo = components.P_Unit.getWithKeys({ entity: unitPrototypes[i], level: defenderLevel });

    if (unitInfo) {
      defensePoints += defenderUnitCount * unitInfo.defense;
    }
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

  return defensePoints;
}
