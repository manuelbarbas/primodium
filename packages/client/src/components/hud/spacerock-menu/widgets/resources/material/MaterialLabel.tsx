import { Entity } from "@latticexyz/recs";
import { encodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { components } from "src/network/components";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";
import { Hex } from "viem";

export const MaterialLabel = ({ name, resource }: { name: string; resource: Entity }) => {
  const selectedRock = components.SelectedRock.use()?.value;
  const owner = components.OwnedBy.use(selectedRock)?.value as Entity | undefined;
  const player = components.Account.get()?.value ?? singletonEntity;

  const entity = encodeEntity(
    { player: "bytes32", resource: "bytes32" },
    { player: (owner ?? player) as Hex, resource: resource as Hex }
  );

  const playerResource = components.PlayerResources.use(entity) ?? {
    resourceCount: 0n,
    resourceStorage: 0n,
    production: 0n,
    resourcesToClaim: 0n,
  };

  const { resourceCount, resourceStorage: maxStorage, production, resourcesToClaim } = playerResource;

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

  return (
    <Badge className={`gap-1 group pointer-events-auto ${maxStorage === 0n ? "badge-error opacity-25" : ""}`}>
      <ResourceIconTooltip
        name={name}
        playerEntity={player}
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
          +{formatNumber((Number(production) * 60) / Number(RESOURCE_SCALE), { fractionDigits: 1 })}
          /MIN{" "}
          <b className="text-accent">
            [
            {formatNumber(maxStorage / RESOURCE_SCALE, {
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
