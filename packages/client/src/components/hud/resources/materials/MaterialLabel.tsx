import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const MaterialLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const playerEntity = useMud().network.playerEntity;
  const { maxStorage, resourceCount, resourcesToClaim, production } = useFullResourceCount(resource, playerEntity);

  const resourceIcon = ResourceImage.get(resource);

  const tooltipClass = useMemo(() => {
    if (maxStorage <= 0n) return;

    const percentFull = (resourceCount + resourcesToClaim) / maxStorage;

    if (percentFull >= 1) {
      return "text-accent";
    }

    if (percentFull >= 0.9) return "text-accent animate-pulse";

    return;
  }, [resourceCount, resourcesToClaim, maxStorage]);

  if (maxStorage > 0n) {
    return (
      <div className="gap-1 mx-1 group pointer-events-auto">
        <ResourceIconTooltip
          short={false}
          name={name}
          playerEntity={playerEntity}
          amount={resourceCount + resourcesToClaim}
          resource={resource}
          image={resourceIcon ?? ""}
          validate={false}
          fontSize={"sm"}
          className={`${tooltipClass}`}
        />
        {production !== 0n && (
          <p className="opacity-50 text-[0rem] group-hover:text-xs transition-all">
            +{formatNumber(Number((production * 60n) / RESOURCE_SCALE), { fractionDigits: 1 })}
            /MIN <b>({Number(maxStorage / RESOURCE_SCALE)})</b>
          </p>
        )}
      </div>
    );
  } else {
    return <></>;
  }
};
