import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { BackgroundImage, ResourceImage } from "src/util/constants";

export const UnitLabel = ({
  name,
  resource,
  count,
  spaceRock,
}: {
  name: string;
  count: bigint;
  resource: Entity;
  spaceRock?: Entity;
}) => {
  const resourceIcon = BackgroundImage.get(resource)?.at(0) ?? ResourceImage.get(resource);

  return (
    <Badge className="">
      <ResourceIconTooltip
        name={name}
        spaceRock={spaceRock}
        amount={count}
        resource={resource}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        direction="top"
      />
    </Badge>
  );
};
