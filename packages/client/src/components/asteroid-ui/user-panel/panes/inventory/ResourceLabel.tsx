import { useEntityQuery } from "@latticexyz/react";
import { EntityID, EntityIndex, Has, HasValue } from "@latticexyz/recs";
import { useMemo } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import {
  AsteroidType,
  Item,
  LastClaimedAt,
  OwnedBy,
  P_MaxStorage,
  Production,
} from "src/network/components/chainComponents";

import {
  Account,
  BlockNumber,
  Hangar,
} from "src/network/components/clientComponents";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";
import { ESpaceRockType } from "src/util/web3/types";
import { world } from "src/network/world";
import { getUnitStats } from "src/util/trainUnits";
import { getMotherlodeResource, mineableResources } from "src/util/resource";

export const ResourceLabel = ({
  name,
  resourceId,
}: {
  name: string;
  resourceId: EntityID;
}) => {
  const { value: blockNumber, avgBlockTime } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const player = Account.use()?.value;
  const query = [
    Has(AsteroidType),
    HasValue(OwnedBy, { value: player }),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const motherlodes = useEntityQuery(query);

  const block = BlockNumber.use()?.value;
  // todo: only update whenever any motherlode's hangar changes. I cannot figure this out rn so im using block

  //****production****//

  //motherlode//
  const motherlodeProduction = useMemo(() => {
    if (!mineableResources.includes(resourceId)) return 0;
    return motherlodes.reduce((prev: number, motherlodeIndex: EntityIndex) => {
      const entity = world.entities[motherlodeIndex];
      const resource = getMotherlodeResource(entity);

      const hangar = Hangar.get(entity);

      if (!hangar || resource?.resource !== resourceId) return prev;

      let total = 0;
      for (let i = 0; i < hangar.units.length; i++) {
        total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
      }
      return prev + total;
    }, 0);
  }, [motherlodes, resourceId, block]);

  //buildings//
  const buildingProduction = useResourceCount(Production, resourceId);

  //total//
  const production = useMemo(() => {
    return buildingProduction + motherlodeProduction;
  }, [buildingProduction, motherlodeProduction]);

  const resourceCount = useResourceCount(Item, resourceId);

  const maxStorage = useResourceCount(P_MaxStorage, resourceId);

  //****claiming****//

  //motherlode//
  const resourcesToClaimFromMotherlode = useMemo(() => {
    if (!mineableResources.includes(resourceId)) return 0;
    return motherlodes.reduce((prev: number, motherlodeIndex: EntityIndex) => {
      const entity = world.entities[motherlodeIndex];
      const resource = getMotherlodeResource(entity);

      const hangar = Hangar.get(entity);

      if (!hangar || resource?.resource !== resourceId) return prev;
      const lastClaimedAt = LastClaimedAt.get(entity)?.value ?? 0;
      let toClaim = (blockNumber - lastClaimedAt) * production;
      if (toClaim > maxStorage - resourceCount)
        toClaim = maxStorage - resourceCount;

      let total = 0;
      for (let i = 0; i < hangar.units.length; i++) {
        total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
      }
      return prev + total * (blockNumber - lastClaimedAt);
    }, 0);
  }, [motherlodes, resourceId, block, resourceCount]);

  //building//
  const buildingProductionLastClaimedAt = useResourceCount(
    LastClaimedAt,
    resourceId
  );
  const resourcesToClaimFromBuilding = useMemo(() => {
    const toClaim =
      (blockNumber - buildingProductionLastClaimedAt) * buildingProduction;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [buildingProductionLastClaimedAt, blockNumber]);

  //total//
  const resourcesToClaim = useMemo(() => {
    let totalUnclaimed =
      resourcesToClaimFromBuilding + resourcesToClaimFromMotherlode;
    if (totalUnclaimed > maxStorage - resourceCount)
      return maxStorage - resourceCount;
    return totalUnclaimed;
  }, [resourcesToClaimFromBuilding, resourcesToClaimFromMotherlode]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
    return (
      <div className="relative flex justify-between items-center border rounded-md border-cyan-900 px-2 py-1 bg-slate-800 shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-slate-900/10 rounded-md" />
        <div className="justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
          <p className="text-slate-400">
            {production
              ? `+ ${formatNumber(
                  (production * RESOURCE_SCALE * 60) / avgBlockTime
                )}/MIN`
              : "-"}
          </p>
        </div>
        <div className="flex justify-between items-center gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between border rounded-md border-cyan-800">
              <p className="px-1 bg-cyan-700 rounded-md rounded-r-none">
                {formatNumber(
                  (resourceCount + resourcesToClaim) * RESOURCE_SCALE
                )}
              </p>
              <b className="rounded-md rounded-l-none bg-slate-700 px-1">
                {formatNumber(maxStorage * RESOURCE_SCALE)}
              </b>
            </div>
            <div className={`flex items-center w-full h-1 rounded-md`}>
              <div
                className="h-full bg-cyan-600 rounded-md"
                style={{
                  width: `${
                    ((resourceCount + resourcesToClaim) / maxStorage) * 100
                  }%`,
                }}
              />

              <div
                className="h-full bg-gray-900 rounded-md"
                style={{
                  width: `${
                    ((maxStorage - resourceCount - resourcesToClaim) /
                      maxStorage) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {resourceCount + resourcesToClaim === maxStorage && (
            <div className="w-2 h-2 bg-rose-600 rounded-sm" />
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
