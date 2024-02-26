import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";

export const UtilityLabel = ({
  name,
  resourceId,
  asteroid,
}: {
  name: string;
  resourceId: Entity;
  asteroid: Entity;
}) => {
  const { resourceCount } = useFullResourceCount(resourceId, asteroid);

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="gap-1">
      <ResourceIconTooltip
        name={name}
        amount={resourceCount}
        resource={resourceId}
        image={resourceIcon ?? ""}
        fontSize={"sm"}
      />
    </Badge>
  );
};
