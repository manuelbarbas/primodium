import { useCallback } from "react";
import { Entity } from "@latticexyz/recs";
import { Badge } from "@/components/core/Badge";
import { IconLabel } from "@/components/core/IconLabel";
import { useFullResourceCount } from "@/hooks/useFullResourceCount";
import { EntityType } from "@/util/constants";
import { formatResourceCount } from "@/util/number";
import { CapacityBar } from "@/components/core/CapacityBar";
import { EntityToResourceImage } from "@/util/mappings";

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
  const { resourceCount, resourceStorage } = useFullResourceCount(resourceId, asteroid);

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
  const { resourceStorage } = useFullResourceCount(resourceId, asteroid);

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
  const { resourceCount, resourceStorage } = useFullResourceCount(resourceId, asteroid);

  const used = resourceStorage - resourceCount;
  const maxStorage = resourceStorage;

  const renderCapacityBar = maxStorage >= 0n;

  const getSuffix = useCallback((resourceId: Entity) => {
    switch (resourceId) {
      case EntityType.Electricity:
        return " MW";
      case EntityType.Housing:
        return " Pop.";
      default:
        return "";
    }
  }, []);

  return (
    <>
      <div className="flex flex-row w-full">
        <img src={EntityToResourceImage[resourceId]} className="pixel-images h-5 w-5 mt-0.5" alt={`${name} icon`} />

        <div className="w-full flex flex-col">
          {renderCapacityBar && <CapacityBar current={used} max={maxStorage} segments={10} resourceType={resourceId} />}
          <div className="flex flex-row">
            <span className="text-xs">{formatResourceCount(resourceId, used)}</span>
            <b className={`text-accent text-xs opacity-50`}>
              /{formatResourceCount(resourceId, maxStorage)}
              {getSuffix(resourceId)}
            </b>
          </div>
        </div>
      </div>
    </>
  );
};
