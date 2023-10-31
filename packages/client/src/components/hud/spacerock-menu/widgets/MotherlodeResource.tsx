import { Entity } from "@latticexyz/recs";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { formatNumber, getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const MotherlodeResource: React.FC<{
  resource: Entity;
  remaining: bigint;
  max: bigint;
}> = ({ resource, remaining, max }) => {
  return (
    <SecondaryCard className="w-full space-y-1">
      <p className="text-xs opacity-75 mb-1">RESOURCES REMAINING</p>
      <Progress value={Number(remaining)} max={Number(max)} className="w-full" />

      <div className="flex justify-between text-xs opacity-75 px-1">
        <IconLabel imageUri={ResourceImage.get(resource) ?? ""} text={getBlockTypeName(resource)} />
        <p>
          {formatNumber(remaining / RESOURCE_SCALE, { fractionDigits: 0 })}/
          {formatNumber(max / RESOURCE_SCALE, { fractionDigits: 0 })}
        </p>
      </div>
    </SecondaryCard>
  );
};
