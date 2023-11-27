import { SecondaryCard } from "src/components/core/Card";

import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { getBlockTypeName } from "src/util/common";
import { ResourceEntityLookup, ResourceImage, ResourceType } from "src/util/constants";
import { Entity } from "@latticexyz/recs";

import { components } from "src/network/components";
import { Hex } from "viem";
import { EResource } from "contracts/config/enums";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const MotherlodeResources: React.FC<{
  motherlodeEntity: Entity;
}> = ({ motherlodeEntity }) => {
  const resources = useFullResourceCounts(motherlodeEntity);
  const motherlodeType = components.Motherlode.getWithKeys({ entity: motherlodeEntity as Hex })?.motherlodeType ?? 0n;
  const rawResource = components.P_RawResource.getWithKeys({ resource: motherlodeType as number })?.value ?? 0n;
  if (!rawResource) return <div></div>;

  const owner = components.OwnedBy.getWithKeys({ entity: motherlodeEntity as Hex }) ?? singletonEntity;

  const { resourcesToClaim, resourceCount } = resources[rawResource];
  let currCount = (resourceCount ?? 0n) + (resourcesToClaim ?? 0n);
  if (currCount < 0n) currCount = 0n;
  const resourceId = ResourceEntityLookup[rawResource as EResource];
  return (
    <DataLabel label="RESOURCES">
      {
        <Badge key={resourceId} className="text-xs gap-2">
          <ResourceIconTooltip
            name={getBlockTypeName(resourceId)}
            image={ResourceImage.get(resourceId) ?? ""}
            resource={resourceId}
            playerEntity={owner as Entity}
            amount={currCount}
            resourceType={ResourceType.Resource}
            validate={false}
            direction="top"
          />
        </Badge>
      }
    </DataLabel>
  );
};
