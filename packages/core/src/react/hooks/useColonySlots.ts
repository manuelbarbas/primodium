import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { Hex } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { ResourceEntityLookup } from "@/lib";
import { useCore } from "@/react/hooks/useCore";

/**
 * Calculates colony slot information for a given player entity.
 *
 * @param playerEntity - The player entity for which to calculate colony slot information.
 * @returns An object containing colony slot information.
 */
export const useColonySlots = (playerEntity: Entity) => {
  const {
    tables,
    utils: { getColonyShipsPlusAsteroids },
  } = useCore();

  const maxSlots = tables.MaxColonySlots.use(playerEntity)?.value ?? 0n;
  const shipsInTraining = tables.ColonyShipsInTraining.use(playerEntity)?.value ?? 0n;
  const config = tables.P_ColonySlotsConfig.use() ?? tables.P_ColonySlotsConfig.get();
  const costMultiplier = useColonySlotsCostMultiplier(playerEntity);
  const time = tables.Time.use()?.value ?? 0n;
  const data = useMemo(() => {
    if (!config)
      return {
        maxSlots: 0n,
        occupiedSlots: [],
        costMultiplier: 0n,
        resourceCosts: {},
      };
    const occupiedSlots = getColonyShipsPlusAsteroids(playerEntity);

    const resourceCosts = config.resources.reduce(
      (acc, resource, i) => {
        const paid =
          tables.ColonySlotsInstallments.getWithKeys({
            playerEntity: playerEntity as Hex,
            resourceIndex: BigInt(i),
          })?.amounts ?? 0n;
        const cost = config.amounts[i] * costMultiplier;
        return { ...acc, [ResourceEntityLookup[resource as EResource]]: { paid, cost } };
      },
      {} as Record<Entity, { cost: bigint; paid: bigint }>,
    );

    return {
      maxSlots,
      occupiedSlots,
      costMultiplier,
      resourceCosts,
    };
  }, [config, costMultiplier, maxSlots, playerEntity, time]);

  return {
    ...data,
    // default to 0 if it's going to be negative
    availableSlots: maxSlots <= BigInt(data.occupiedSlots.length) ? 0n : maxSlots - BigInt(data.occupiedSlots.length),
    shipsInTraining,
    maxSlots,
  };
};

export const useColonySlotsCostMultiplier = (playerEntity: Entity) => {
  const { tables } = useCore();

  const maxColonySlots = tables.MaxColonySlots.use(playerEntity)?.value ?? 0n;
  const multiplier = tables.P_ColonySlotsConfig.use()?.multiplier ?? 1n;
  return multiplier ** maxColonySlots;
};
