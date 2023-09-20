import { EntityID } from "@latticexyz/recs";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage, ResourceType } from "src/util/constants";

export const UtilityLabel = ({
  name,
  resourceId,
}: {
  name: string;
  resourceId: EntityID;
}) => {
  const { resourceCount, maxStorage, resourcesToClaim } = useFullResourceCount(
    resourceId,
    ResourceType.Utility
  );

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        amount={maxStorage - resourceCount + resourcesToClaim}
        resourceId={resourceId}
        scale={1}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
    </div>
  );
};
