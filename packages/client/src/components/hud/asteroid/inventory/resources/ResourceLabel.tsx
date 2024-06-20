import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { Badge } from "@/components/core/Badge";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { Tooltip } from "@/components/core/Tooltip";
import { formatResourceCount, SPEED_SCALE } from "@primodiumxyz/core";
import { useCore, useResourceCount } from "@primodiumxyz/core/react";
import { EntityToResourceImage } from "@/util/image";

export const ResourceLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const { tables } = useCore();
  const activeRock = tables.ActiveRock.use(undefined, {
    value: tables.ActiveRock.get()?.value,
  })?.value;
  if (!activeRock) throw new Error("[ResourceLabel] No active rock");

  const worldSpeed = tables.P_GameConfig.use()?.worldSpeed ?? SPEED_SCALE;
  const { resourceCount, production, resourceStorage } = useResourceCount(resource, activeRock);

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
    production == 1n
      ? "0.6"
      : formatResourceCount(resource, (production * 60n * worldSpeed) / SPEED_SCALE, { fractionDigits: 1 });

  return (
    // non-breaking space on the resource names to keep on the same line
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
