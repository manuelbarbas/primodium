import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { RESOURCE_SCALE, SPEED_SCALE } from "src/util/constants";
import { formatNumber, formatResourceCount } from "src/util/number";
import { Tooltip } from "@/components/core/Tooltip";

export const ResourceLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) throw new Error("[ResourceLabel] No active rock");

  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? SPEED_SCALE;
  const { resourceCount, production, resourceStorage } = useFullResourceCount(resource, activeRock);

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
    // non-breaking space on the resource names
    <Tooltip tooltipContent={name.replace(" ", "\u00A0")} direction="left">
      <Badge
        variant={resourceStorage === 0n ? "error" : "neutral"}
        className={`${resourceStorage === 0n ? "opacity-25" : ""}`}
      >
        <ResourceIconTooltip
          name={name}
          amount={resourceCount}
          resource={resource}
          image={EntityToResourceImage[resource]}
          fontSize={"sm"}
          direction="top"
          className={`${tooltipClass}`}
        />
        <b className={`text-gray-400 text-xs opacity-50`}>
          /
          {formatResourceCount(resource, resourceStorage, {
            short: true,
            fractionDigits: 1,
          })}
        </b>
        {production !== 0n && (
          <p
            className={`opacity-50 text-xs ${
              production > 0 ? "text-success" : production < 0 ? "animate-pulse text-error" : ""
            }`}
          >
            {production > 0 ? "+" : ""}
            {productionMin}
            /MIN
          </p>
        )}
      </Badge>
    </Tooltip>
  );
};
