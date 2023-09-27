import { world } from "src/network/world";
import newComponent from "./Component";
import { EntityID, Type } from "@latticexyz/recs";
import { BlockNumber } from "../clientComponents";
import { useMemo } from "react";
import { ESendType } from "src/util/web3/types";

export const newArrivalComponent = () => {
  const component = newComponent(
    world,
    {
      sendType: Type.Number,
      unitCounts: Type.NumberArray,
      unitTypes: Type.StringArray,
      arrivalBlock: Type.String,
      from: Type.Entity,
      to: Type.Entity,
      origin: Type.Entity,
      destination: Type.Entity,
      timestamp: Type.Number,
    },
    {
      id: "Arrival",
      metadata: { contractId: `component.Arrival` },
    }
  );

  const getWithId = (id: EntityID) => {
    return component.get(id);
  };

  const get = (filters?: {
    to?: EntityID;
    from?: EntityID;
    origin?: EntityID;
    destination?: EntityID;
    sendType?: ESendType;
    onlyOrbiting?: boolean;
    onlyTransit?: boolean;
  }) => {
    if (filters?.onlyOrbiting && filters?.onlyTransit)
      throw new Error("Cannot filter for both orbiting and transit");
    const blockNumber = BlockNumber.get()?.value ?? 0;
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
      if (filters.destination && elem?.destination !== filters.destination)
        return false;
      if (filters.sendType && elem?.sendType !== filters.sendType) return false;
      if (filters.onlyOrbiting && Number(elem.arrivalBlock) >= blockNumber)
        return false;
      if (filters.onlyTransit && Number(elem.arrivalBlock) < blockNumber) {
        return false;
      }
      return true;
    });
  };

  const use = (filters?: {
    to?: EntityID;
    from?: EntityID;
    origin?: EntityID;
    destination?: EntityID;
    sendType?: ESendType;
    onlyOrbiting?: boolean;
    onlyTransit?: boolean;
  }) => {
    const blockNumber = BlockNumber.use()?.value ?? 0;

    return useMemo(() => get(filters), [blockNumber]);
  };

  return { ...component, get, getWithId, use, getEntity: component.get };
};
