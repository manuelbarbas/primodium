import { useEntityQuery } from "@latticexyz/react";
import { EntityID, Has, HasValue, EntityIndex } from "@latticexyz/recs";
import { useMemo } from "react";
import {
  AsteroidType,
  OwnedBy,
  Item,
  P_MaxStorage,
  Production,
  LastClaimedAt,
  OccupiedUtilityResource,
} from "src/network/components/chainComponents";
import {
  BlockNumber,
  Account,
  Hangar,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { mineableResources, getMotherlodeResource } from "src/util/resource";
import { getUnitStats } from "src/util/trainUnits";
import { ESpaceRockType } from "src/util/web3/types";
import useResourceCount from "./useResourceCount";
import { ResourceType } from "src/util/constants";

export function useFullResourceCount(
  resourceID: EntityID,
  type = ResourceType.Resource
) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
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

  // todo: only update whenever any motherlode's hangar changes. I cannot figure this out rn so im using block
  const motherlodeProduction = useMemo(() => {
    if (!mineableResources.includes(resourceID)) return 0;
    return motherlodes.reduce((prev: number, motherlodeIndex: EntityIndex) => {
      const entity = world.entities[motherlodeIndex];
      const resource = getMotherlodeResource(entity);

      const hangar = Hangar.get(entity);

      if (!hangar || resource?.resource !== resourceID) return prev;

      let total = 0;
      for (let i = 0; i < hangar.units.length; i++) {
        total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
      }
      return prev + total;
    }, 0);
  }, [motherlodes, resourceID, blockNumber]);

  const resourceCount = useResourceCount(
    ResourceType.Resource === type ? Item : OccupiedUtilityResource,
    resourceID
  );

  const maxStorage = useResourceCount(P_MaxStorage, resourceID);

  const production =
    useResourceCount(Production, resourceID) + motherlodeProduction;

  const lastClaimedAt = useResourceCount(LastClaimedAt, resourceID);

  const resourcesToClaim = useMemo(() => {
    const toClaim = (blockNumber - lastClaimedAt) * production;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [lastClaimedAt, blockNumber]);

  return { resourceCount, resourcesToClaim, maxStorage, production };
}
