import { SecondaryCard } from "src/components/core/Card";

import {
  RESOURCE_SCALE,
  ResourceImage,
  ResourceType,
} from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { getSpaceRockInfo } from "src/util/spacerock";
import { Badge } from "src/components/core/Badge";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const AsteroidResource: React.FC<{
  resources: ReturnType<typeof getSpaceRockInfo>["resources"];
}> = ({ resources }) => {
  if (resources.length === 0) return <></>;

  return (
    <DataLabel label="RESOURCES">
      {resources.map((resource) => {
        return (
          <Badge key={resource.id} className="text-xs gap-2">
            <ResourceIconTooltip
              name={getBlockTypeName(resource.id)}
              image={ResourceImage.get(resource.id) ?? ""}
              resourceId={resource.id}
              amount={resource.amount}
              resourceType={ResourceType.Resource}
              scale={RESOURCE_SCALE}
              direction="top"
            />
          </Badge>
        );
      })}
    </DataLabel>
  );
};
