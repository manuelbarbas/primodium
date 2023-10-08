import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { BlockNumber } from "src/network/components/clientComponents";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const MaterialLabel = ({ name, resourceId }: { name: string; resourceId: EntityID }) => {
  const { maxStorage, resourceCount, resourcesToClaim, production } = useFullResourceCount(resourceId);
  const { avgBlockTime } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const resourceIcon = ResourceImage.get(resourceId);

  const tooltipClass = useMemo(() => {
    const percentFull = (resourceCount + resourcesToClaim) / maxStorage;

    if (percentFull >= 1) {
      return "text-accent";
    }

    if (percentFull >= 0.9) return "text-accent animate-pulse";

    return undefined;
  }, [resourceCount, resourcesToClaim, maxStorage]);

  if (maxStorage > 0) {
    return (
      <div className="gap-1 mx-1 group pointer-events-auto">
        <ResourceIconTooltip
          name={name}
          amount={resourceCount + resourcesToClaim}
          resourceId={resourceId}
          image={resourceIcon ?? ""}
          validate={false}
          fontSize={"sm"}
          className={`${tooltipClass}`}
        />
        {production !== 0 && (
          <p className="opacity-50 text-[0rem] group-hover:text-xs transition-all">
            +{formatNumber((production * RESOURCE_SCALE * 60) / avgBlockTime, 1)}
            /MIN <b>({maxStorage * RESOURCE_SCALE})</b>
          </p>
        )}
      </div>
    );
  } else {
    return <></>;
  }
};
