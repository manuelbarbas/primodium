import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { RESOURCE_SCALE, ResourceImage, SPEED_SCALE } from "src/util/constants";
import { formatNumber } from "src/util/number";

export const MaterialLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const selectedRock = components.SelectedRock.use()?.value;

  const resourceIcon = ResourceImage.get(resource);
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? SPEED_SCALE;
  const { resourceCount, production, resourceStorage } = useFullResourceCount(resource, selectedRock);

  // if (EntityType.Iridium == resource)
  // console.log(`resourceCount: ${resourceCount} production: ${production} resourceStorage: ${resourceStorage}`);
  const tooltipClass = useMemo(() => {
    if (resourceStorage <= BigInt(0)) return;

    const percentFull = resourceCount / resourceStorage;

    if (percentFull >= 1) {
      return "text-accent";
    }

    if (percentFull >= 0.9) return "text-accent animate-pulse";

    return;
  }, [resourceCount, resourceStorage]);

  const productionMin =
    production == 1n ? "0.6" : formatNumber((production * 60n * worldSpeed) / (SPEED_SCALE * RESOURCE_SCALE));

  return (
    <Badge className={`gap-1 group pointer-events-auto ${resourceStorage === 0n ? "badge-error opacity-25" : ""}`}>
      <ResourceIconTooltip
        name={name}
        spaceRock={selectedRock}
        amount={resourceCount}
        resource={resource}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        direction="top"
        className={`${tooltipClass}`}
      />
      {production !== 0n && (
        <p className="opacity-50 text-xs transition-all">
          {production > 0 ? "+" : ""}
          {productionMin}
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
