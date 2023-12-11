import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { components } from "src/network/components";
import { formatNumber } from "src/util/common";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { RESOURCE_SCALE, ResourceImage, SPEED_SCALE } from "src/util/constants";

export const MaterialLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const selectedRock = components.SelectedRock.use()?.value;

  const resourceIcon = ResourceImage.get(resource);
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? SPEED_SCALE;
  const { resourceCount, resourcesToClaim, production, resourceStorage } = useFullResourceCount(resource, selectedRock);
  const tooltipClass = useMemo(() => {
    if (resourceStorage <= BigInt(0)) return;

    const percentFull = (resourceCount + resourcesToClaim) / resourceStorage;

    if (percentFull >= 1) {
      return "text-accent";
    }

    if (percentFull >= 0.9) return "text-accent animate-pulse";

    return;
  }, [resourceCount, resourcesToClaim, resourceStorage]);

  return (
    <Badge className={`gap-1 group pointer-events-auto ${resourceStorage === 0n ? "badge-error opacity-25" : ""}`}>
      <ResourceIconTooltip
        name={name}
        spaceRock={selectedRock}
        amount={resourceCount + resourcesToClaim}
        resource={resource}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        direction="top"
        className={`${tooltipClass}`}
      />
      {production !== 0n && (
        <p className="opacity-50 text-xs transition-all">
          +{formatNumber((production * 60n * worldSpeed) / (SPEED_SCALE * RESOURCE_SCALE), { fractionDigits: 1 })}
          /MIN
          <b className="text-accent">
            [
            {formatNumber(resourceStorage / RESOURCE_SCALE, {
              short: true,
              fractionDigits: 1,
            })}
            ]
          </b>
        </p>
      )}
    </Badge>
  );
};
