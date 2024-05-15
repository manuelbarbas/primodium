import { useState, useEffect } from "react";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getFullResourceCount, getFullResourceCounts } from "src/util/resource";

export function useFullResourceCount(resource: Entity, spaceRockEntity: Entity, interval = 0) {
  const time = components.Time.use(undefined)?.value ?? 0n;
  const [intervalUpdate, setIntervalUpdate] = useState(0);

  useEffect(() => {
    if (interval > 0) {
      const int = setInterval(() => {
        setIntervalUpdate((prev) => prev + 1);
      }, interval * 1000);
      return () => clearInterval(int);
    }
  }, [interval]);

  return useMemo(() => {
    return getFullResourceCount(resource, spaceRockEntity);
  }, [resource, spaceRockEntity, interval > 0 ? intervalUpdate : time]);
}

export function useFullResourceCounts(spaceRockEntity: Entity, interval = 0) {
  const time = components.Time.use(undefined)?.value ?? 0n;
  const [intervalUpdate, setIntervalUpdate] = useState(0);

  useEffect(() => {
    if (interval > 0) {
      const int = setInterval(() => {
        setIntervalUpdate((prev) => prev + 1);
      }, interval * 1000);
      return () => clearInterval(int);
    }
  }, [interval]);

  return useMemo(() => {
    if (spaceRockEntity === singletonEntity) return new Map() as ReturnType<typeof getFullResourceCounts>;
    return getFullResourceCounts(spaceRockEntity);
  }, [spaceRockEntity, interval > 0 ? intervalUpdate : time]);
}
