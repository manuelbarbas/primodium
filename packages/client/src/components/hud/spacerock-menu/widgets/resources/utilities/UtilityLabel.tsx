import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";

export const UtilityLabel = ({ name, resourceId }: { name: string; resourceId: Entity }) => {
  const playerEntity = useMud().network.playerEntity;
  const { resourceCount } = useFullResourceCount(resourceId);

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="gap-1">
      <ResourceIconTooltip
        name={name}
        playerEntity={playerEntity}
        amount={resourceCount}
        resource={resourceId}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
    </Badge>
  );
};
