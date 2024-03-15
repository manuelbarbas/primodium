import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";
import { CapacityBar } from "./CapacityBar";

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
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="w-full flex justify-start">
      <IconLabel
        tooltipText={name}
        tooltipDirection="top"
        imageUri={resourceIcon ?? ""}
        text={formatResourceCount(resourceId, showCount ? resourceCount : used)}
        className="mr-1"
      />
      <b className={`text-accent text-xs opacity-50`}>/{formatResourceCount(resourceId, resourceStorage)}</b>
    </Badge>
  );
};


export const StorageUtilityLabel = ({
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
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="w-full flex justify-start text-[.7rem]">
      <IconLabel
        tooltipText={name}
        tooltipDirection="top"
        imageUri={resourceIcon ?? ""}
        text={formatResourceCount(resourceId, resourceStorage)}
      />

    </Badge>
  );
};

export const BarLayoutUtilityLabel = ({
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

  const used = Number(resourceStorage) - Number(resourceCount);
  const maxStorage = Number(resourceStorage);
  const resourceIcon = ResourceImage.get(resourceId);

  const renderCapacityBar = maxStorage >= 0;

  const getSuffix = (name: string) => {
    switch(name) {
      case 'Electricity':
        return ' MW';
      case 'Housing':
        return ' Pop.';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="flex flex-row w-full">
        <img src={resourceIcon} className="pixel-images h-5 w-5 mt-0.5" alt={`${name} icon`} />

        <div className="w-full flex flex-col">
          {renderCapacityBar && (
            <CapacityBar current={used >= 0 ? used : 0} max={maxStorage} segments={8} name={name} />
          )}
          <div className="flex flex-row">
            <span className="text-xs">{formatResourceCount(resourceId, showCount ? resourceCount : used)}</span>
            <b className={`text-accent text-xs opacity-50`}>/{formatResourceCount(resourceId, maxStorage)}{getSuffix(name)}</b>
          </div>
        </div>
      </div>

    </>
  );
};