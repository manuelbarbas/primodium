import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { usePlayerFullResourceCounts } from "src/hooks/useFullResourceCount";
import { Account } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { ResourceStorages } from "src/util/constants";
import { isUtility } from "src/util/resource";
import { MaterialLabel } from "./MaterialLabel";

export const AllMaterialLabels = () => {
  const playerEntity = Account.get()?.value ?? singletonEntity;
  const playerFullResourceCounts = usePlayerFullResourceCounts(playerEntity);
  console.log("playerFullResourceCounts", playerFullResourceCounts);

  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      {Array.from(ResourceStorages).map((rawResource) => {
        const resource = rawResource as Entity;
        const fullResourceCount = playerFullResourceCounts[resource];
        if (!fullResourceCount || isUtility(resource) || fullResourceCount.resourceStorage == 0n) return null;
        return (
          <MaterialLabel
            key={`label-${resource}`}
            name={getBlockTypeName(resource)}
            resource={resource}
            maxStorage={fullResourceCount.resourceStorage}
            resourceCount={fullResourceCount.resourceCount}
            resourcesToClaim={fullResourceCount.resourcesToClaim}
            production={fullResourceCount.production}
          />
        );
      })}
    </SecondaryCard>
  );
};
