import { EntityID } from "@latticexyz/recs";
import { BackgroundImage } from "src/util/constants";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";

export const UnitLabel = ({
  name,
  resourceId,
  count,
}: {
  name: string;
  count: number;
  resourceId: EntityID;
}) => {
  const resourceIcon = BackgroundImage.get(resourceId)?.at(0);

  return (
    <div className="mx-1">
      <ResourceIconTooltip
        name={name}
        amount={count}
        scale={1}
        resourceId={resourceId}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        direction="left"
      />
    </div>
  );
};
