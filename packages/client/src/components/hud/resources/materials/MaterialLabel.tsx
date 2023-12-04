import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const MaterialLabel = ({
  name,
  resource,
  maxStorage,
  resourceCount,
  resourcesToClaim,
  production,
  spaceRock,
}: {
  name: string;
  resource: Entity;
  maxStorage: bigint;
  resourceCount: bigint;
  resourcesToClaim: bigint;
  production: bigint;
  spaceRock?: Entity;
}) => {
  const resourceIcon = ResourceImage.get(resource);

  const tooltipClass = useMemo(() => {
    if (maxStorage <= BigInt(0)) return;

    const percentFull = (resourceCount + resourcesToClaim) / maxStorage;

    if (percentFull >= 1) {
      return "text-accent";
    }

    if (percentFull >= 0.9) return "text-accent animate-pulse";

    return;
  }, [resourceCount, resourcesToClaim, maxStorage]);

  if (maxStorage === 0n) return null;
  return (
    <div className="gap-1 mx-1 group pointer-events-auto">
      <ResourceIconTooltip
        spaceRock={spaceRock}
        name={name}
        amount={resourceCount + resourcesToClaim}
        resource={resource}
        image={resourceIcon ?? ""}
        fontSize={"sm"}
        className={`${tooltipClass}`}
      />
      {production !== 0n && (
        <p className="opacity-50 text-[0rem] group-hover:text-xs transition-all">
          +{formatNumber(Number(production) * 6, { fractionDigits: 1 })}
          /MIN <b>({Number(maxStorage / RESOURCE_SCALE)})</b>
        </p>
      )}
    </div>
  );
};
