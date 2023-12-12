import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { formatNumber } from "src/util/common";
import { EntityType, RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const ElectricityLabel = () => {
  const selectedRock = components.SelectedRock.use()?.value;
  const { resourceCount, resourceStorage: maxStorage } = useFullResourceCount(EntityType.Electricity, selectedRock);

  const resourceIcon = ResourceImage.get(EntityType.Electricity);
  const percentFull = Math.round((Number(resourceCount) / Number(maxStorage)) * 100);

  return (
    <div className="flex flex-col items-center gap-1 w-fit">
      <SecondaryCard className="flex flex-row w-full gap-1 items-center rounded-r-none">
        <IconLabel imageUri={resourceIcon ?? ""} tooltipText="Electricity" className="text-sm" />

        <Progress value={Number(resourceCount)} max={Number(maxStorage)} className="w-24 progress-success" />
        <p className="text-xs opacity-75 font-bold uppercase">{isNaN(percentFull) ? 0 : percentFull}%</p>
      </SecondaryCard>
      <p className="text-xs opacity-75 font-bold">
        {formatNumber(resourceCount / RESOURCE_SCALE)}/{formatNumber(maxStorage / RESOURCE_SCALE)} MWH
      </p>
    </div>
  );
};
