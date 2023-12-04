import { Entity } from "@latticexyz/recs";
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
    <ResourceIconTooltip
      name={name}
      amount={resourceCount}
      resource={resourceId}
      image={resourceIcon ?? ""}
      spaceRock={spaceRock}
      fontSize={"sm"}
      className="m-1"
    />
  );
};
