import { SecondaryCard } from "src/components/core/Card";

import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceType } from "src/util/constants";
import { getSpaceRockInfo } from "src/util/spacerock";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const AsteroidResource: React.FC<{
  resources: ReturnType<typeof getSpaceRockInfo>["resources"];
  spaceRock?: Entity;
}> = ({ resources, spaceRock }) => {
  if (resources.length === 0) return <></>;

  return (
    <DataLabel label="RESOURCES">
      {resources.map((resource) => {
        return (
          <Badge key={resource.id} className="text-xs gap-2">
            <ResourceIconTooltip
              spaceRock={spaceRock}
              name={getBlockTypeName(resource.id)}
              image={ResourceImage.get(resource.id) ?? ""}
              resource={resource.id}
              amount={resource.amount}
              resourceType={ResourceType.Resource}
              direction="top"
            />
          </Badge>
        );
      })}
    </DataLabel>
  );
};
