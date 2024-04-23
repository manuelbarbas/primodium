import { components } from "@/network/components";
import { getColonyShipsPlusAsteroids, getColonySlotsCostMultiplier } from "@/util/colonyShip";
import { ResourceEntityLookup } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { Hex } from "viem";

export const useColonySlots = (playerEntity: Entity) => {
  const maxSlots = components.MaxColonySlots.use(playerEntity)?.value ?? 0n;
  const shipsInTraining = components.ColonyShipsInTraining.get(playerEntity)?.value ?? 0n;
  const config = components.P_ColonySlotsConfig.use();
  const data = useMemo(() => {
    if (!config) throw new Error("No colony slots config found");
    const occupiedSlots = getColonyShipsPlusAsteroids(playerEntity);
    const costMultiplier = getColonySlotsCostMultiplier(playerEntity);

    const resourceCosts = config.resources.reduce((acc, resource, i) => {
      const paid =
        components.ColonySlotsInstallments.getWithKeys({
          playerEntity: playerEntity as Hex,
          resourceIndex: BigInt(i),
        })?.amounts ?? 0n;
      const cost = config.amounts[i] * costMultiplier;
      return { ...acc, [ResourceEntityLookup[resource as EResource]]: { paid, cost } };
    }, {} as Record<Entity, { cost: bigint; paid: bigint }>);

    return {
      maxSlots,
      occupiedSlots,
      costMultiplier,
      resourceCosts,
    };
  }, [config, maxSlots, playerEntity]);

  return {
    ...data,
    availableSlots: maxSlots - BigInt(data.occupiedSlots.length),
    shipsInTraining,
    maxSlots,
  };
};
