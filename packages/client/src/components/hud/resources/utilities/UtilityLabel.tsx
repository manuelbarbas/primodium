import { Entity } from "@latticexyz/recs";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";

export const UtilityLabel = ({ name, resourceId }: { name: string; resourceId: Entity }) => {
  const playerEntity = useMud().network.playerEntity;
  const { resourceCount, maxStorage, resourcesToClaim } = useFullResourceCount(resourceId, playerEntity);

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        playerEntity={playerEntity}
        amount={maxStorage - (resourceCount + resourcesToClaim)}
        resource={resourceId}
        scale={1n}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
    </div>
  );
};
