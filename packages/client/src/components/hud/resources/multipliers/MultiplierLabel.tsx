import { Entity } from "@latticexyz/recs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage, ResourceType } from "src/util/constants";

export const MultiplierLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const playerEntity = useMud().network.playerEntity;
  const { resourceCount } = useFullResourceCount(resource, playerEntity);

  const resourceIcon = ResourceImage.get(resource);

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        playerEntity={playerEntity}
        amount={resourceCount}
        resource={resource}
        scale={1n}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        resourceType={ResourceType.Multiplier}
      />
    </div>
  );
};
