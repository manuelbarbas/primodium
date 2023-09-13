import { EntityID } from "@latticexyz/recs";
import { ResourceImage } from "src/util/constants";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";

export const MaterialLabel = ({
  name,
  resourceId,
}: {
  name: string;
  resourceId: EntityID;
}) => {
  const { maxStorage, resourceCount, resourcesToClaim } =
    useFullResourceCount(resourceId);
  // const { avgBlockTime } = BlockNumber.use(undefined, {
  //   value: 0,
  //   avgBlockTime: 1,
  // });

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
    return (
      <div className="mx-1">
        <ResourceIconTooltip
          name={name}
          amount={resourceCount + resourcesToClaim}
          resourceId={resourceId}
          image={resourceIcon ?? ""}
          validate={false}
          fontSize={"sm"}
        />
      </div>
    );
  } else {
    return <></>;
  }
};
