import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";

export const UtilityLabel = ({
  name,
  resourceId,
  spaceRock,
}: {
  name: string;
  resourceId: Entity;
  spaceRock?: Entity;
}) => {
  const { resourceCount } = useFullResourceCount(resourceId);

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="gap-1">
      <ResourceIconTooltip
        name={name}
        spaceRock={spaceRock}
        amount={resourceCount}
        resource={resourceId}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
    </Badge>
  );
};
