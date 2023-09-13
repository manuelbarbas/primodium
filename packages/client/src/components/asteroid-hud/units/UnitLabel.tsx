import { EntityID } from "@latticexyz/recs";
import { BackgroundImage } from "src/util/constants";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";

export const UnitLabel = ({
  name,
  resourceId,
}: {
  name: string;
  resourceId: EntityID;
}) => {
  const resourceIcon = BackgroundImage.get(resourceId)?.at(0);

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        amount={0}
        resourceId={resourceId}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
    </div>
  );
};
