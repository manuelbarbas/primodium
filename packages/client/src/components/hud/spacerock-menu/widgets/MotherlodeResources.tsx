import { SecondaryCard } from "src/components/core/Card";

import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { getBlockTypeName } from "src/util/common";
import { ResourceEntityLookup, ResourceImage, ResourceType } from "src/util/constants";

import { EResource } from "contracts/config/enums";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { Hex } from "viem";

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
  const motherlodeType = components.Motherlode.useWithKeys({ entity: motherlodeEntity as Hex })?.motherlodeType;
  const rawResource = components.P_RawResource.useWithKeys({ resource: motherlodeType ?? 0 })?.value ?? 0n;
  const rawResourceId = ResourceEntityLookup[rawResource as EResource];
  const { resourceCount } = useFullResourceCount(rawResourceId, motherlodeEntity);
  if (!rawResource || !motherlodeType) return null;

  const resourceId = ResourceEntityLookup[motherlodeType as EResource];

  let currCount = resourceCount ?? 0n;
  if (currCount < 0n) currCount = 0n;
  return (
    <DataLabel label="RESOURCES">
      {
        <Badge key={rawResourceId} className="text-xs gap-2">
          <ResourceIconTooltip
            name={getBlockTypeName(resourceId)}
            image={ResourceImage.get(resourceId) ?? ""}
            resource={rawResourceId}
            spaceRock={motherlodeEntity}
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
