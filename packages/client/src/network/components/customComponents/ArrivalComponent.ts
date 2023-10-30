import { Entity, Type } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { useMemo } from "react";
import { world } from "src/network/world";
import { getNow } from "src/util/time";
import { BlockNumber } from "../clientComponents";
import { createExtendedComponent } from "./ExtendedComponent";

export const createArrivalComponent = () => {
  const component = createExtendedComponent(world, {
    sendType: Type.Number,
    unitCounts: Type.BigIntArray,
    sendTime: Type.BigInt,
    arrivalTime: Type.BigInt,
    from: Type.Entity,
    to: Type.Entity,
    origin: Type.Entity,
    destination: Type.Entity,
  });

  const getWithId = (id: Entity) => {
    return component.get(id);
  };

  const get = (filters?: {
    to?: Entity;
    from?: Entity;
    origin?: Entity;
    destination?: Entity;
    sendType?: ESendType;
    onlyOrbiting?: boolean;
    onlyTransit?: boolean;
  }) => {
    if (filters?.onlyOrbiting && filters?.onlyTransit) throw new Error("Cannot filter for both orbiting and transit");
    const all = component.getAll().map((entity) => {
      const comp = component.get(entity);
      if (!comp) return undefined;
      return {
        entity,
        ...comp,
      };
    });
    if (!filters) return all;
    return all.filter((elem) => {
      if (elem == undefined) return false;

      if (filters.to && elem.to !== filters.to) return false;
      if (filters.from && elem?.from !== filters.from) return false;
      if (filters.origin && elem?.origin !== filters.origin) return false;
      if (filters.destination && elem?.destination !== filters.destination) return false;
      if (filters.sendType && elem?.sendType !== filters.sendType) return false;
      const now = getNow();
      if (filters.onlyOrbiting && Number(elem.arrivalTime) >= now) return false;
      if (filters.onlyTransit && Number(elem.arrivalTime) < now) {
        return false;
      }
      return true;
    });
  };

  const useValue = (filters?: {
    to?: Entity;
    from?: Entity;
    origin?: Entity;
    destination?: Entity;
    sendType?: ESendType;
    onlyOrbiting?: boolean;
    onlyTransit?: boolean;
  }) => {
    const blockNumber = BlockNumber.use()?.value ?? 0;

    return useMemo(() => get(filters), [blockNumber]);
  };

  return { ...component, get, getWithId, use: useValue, getEntity: component.get };
};
