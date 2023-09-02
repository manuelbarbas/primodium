import { world } from "src/network/world";
import newComponent from "./Component";
import { ComponentValue, EntityID, Type } from "@latticexyz/recs";
import { BlockNumber } from "../clientComponents";
import { useMemo } from "react";
import { ESendType } from "src/util/web3/types";
import { ArrivalsIndex, ArrivalsSize } from "../chainComponents";
import { hashKeyEntity } from "src/util/encode";

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
    },
    {
      id: "Arrival",
      metadata: { contractId: `component.Arrival` },
    }
  );

  const getWithId = (id: EntityID) => {
    return component.get(id);
  };

  function getIndex(
    entity: EntityID,
    arrival: ComponentValue<typeof component.schema>
  ) {
    const playerAsteroidEntity =
      arrival.sendType == ESendType.REINFORCE
        ? hashKeyEntity(arrival.to, arrival.destination)
        : hashKeyEntity(arrival.from, arrival.destination);
    const size = ArrivalsSize.get(playerAsteroidEntity)?.value ?? 0;
    for (let i = 0; i < size + 1; i++) {
      const arrivalEntity = ArrivalsIndex.get(
        hashKeyEntity(playerAsteroidEntity, i)
      )?.value;
      if (arrivalEntity == entity) return i;
    }
    return;
  }
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
    let all = component.getAll().map((entity) => {
      const comp = component.get(entity);
      if (!comp) return undefined;
      const index = getIndex(entity, comp);
      return {
        index,
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

    return useMemo(() => get(filters), [blockNumber, ArrivalsSize.update$]);
  };

  return { ...component, get, getWithId, use, getEntity: component.get };
};
