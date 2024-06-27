import { Badge } from "@/components/core/Badge";
import { CapacityBar } from "@/components/core/CapacityBar";
import { IconLabel } from "@/components/core/IconLabel";
import { Tooltip } from "@/components/core/Tooltip";
import { Entity } from "@primodiumxyz/reactive-tables";
import { useCallback } from "react";
import { useResourceCount } from "@primodiumxyz/core/react";
import { formatResourceCount, EntityType } from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";

export const UtilityLabel = ({
  name,
  resourceId,
  asteroid,
  showCount,
}: {
  name: string;
  resourceId: Entity;
  asteroid: Entity;
  showCount?: boolean;
}) => {
  const { resourceCount, resourceStorage } = useResourceCount(resourceId, asteroid);

  const used = resourceStorage - resourceCount;

  return (
    <Badge className="w-full flex justify-start" tooltip={name}>
      <IconLabel
        imageUri={EntityToResourceImage[resourceId]}
        text={formatResourceCount(resourceId, showCount ? resourceCount : used)}
        className="mr-1"
      />
      <b className={`text-accent text-xs opacity-50`}>/{formatResourceCount(resourceId, resourceStorage)}</b>
    </Badge>
  );
};

export const VaultUtilityLabel = ({
  name,
  resourceId,
  asteroid,
}: {
  name: string;
  resourceId: Entity;
  asteroid: Entity;
}) => {
  const { resourceStorage } = useResourceCount(resourceId, asteroid);

  return (
    <Badge
      className="w-full flex justify-start text-[.7rem] bg-transparent border-none pointer-events-auto"
      tooltip={name}
      tooltipDirection="left"
    >
      <IconLabel imageUri={EntityToResourceImage[resourceId]} text={formatResourceCount(resourceId, resourceStorage)} />
    </Badge>
  );
};

export const BarLayoutUtilityLabel = ({
  name,
  resourceId,
  asteroid,
}: {
  name: string;
  resourceId: Entity;
  asteroid: Entity;
}) => {
  const { resourceCount, resourceStorage } = useResourceCount(resourceId, asteroid);

  const used = resourceStorage - resourceCount;
  const maxStorage = resourceStorage;

  const renderCapacityBar = maxStorage >= 0n;

  const getSuffix = useCallback((resourceId: Entity) => {
    switch (resourceId) {
      case EntityType.Electricity:
        return "GIGAWATTS";
      case EntityType.Housing:
        return "HOUSING";
      default:
        return "";
    }
  }, []);

  return (
    // non-breaking space on the resource names to keep on the same line
    <Tooltip tooltipContent={name.replace(" ", "\u00A0")} direction="left">
      <div className="flex flex-row w-full">
        <img src={EntityToResourceImage[resourceId]} className="pixel-images h-5 w-5 mt-0.5" alt={`${name} icon`} />

        <div className="w-full flex flex-col">
          {renderCapacityBar && <CapacityBar current={used} max={maxStorage} segments={20} resourceType={resourceId} />}
          <div className="flex flex-row">
            <span className="text-xs">{formatResourceCount(resourceId, used)}</span>
            <b className={`text-accent text-xs opacity-50`}>
              /{formatResourceCount(resourceId, maxStorage)} {getSuffix(resourceId)}
            </b>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};
