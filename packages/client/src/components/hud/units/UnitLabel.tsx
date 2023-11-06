import { Entity } from "@latticexyz/recs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { BackgroundImage, ResourceImage } from "src/util/constants";

export const UnitLabel = ({ name, resource, count }: { name: string; count: bigint; resource: Entity }) => {
  const resourceIcon = BackgroundImage.get(resource)?.at(0) ?? ResourceImage.get(resource);
  const playerEntity = useMud().network.playerEntity;

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        playerEntity={playerEntity}
        amount={count}
        resource={resource}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        direction="left"
      />
    </div>
  );
};
