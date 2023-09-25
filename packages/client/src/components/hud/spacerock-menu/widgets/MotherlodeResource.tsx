import { SecondaryCard } from "src/components/core/Card";
import { EntityID } from "@latticexyz/recs";
import { Progress } from "src/components/core/Progress";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";
import { IconLabel } from "src/components/core/IconLabel";
import { formatNumber, getBlockTypeName } from "src/util/common";

export const MotherlodeResource: React.FC<{
  resource: EntityID;
  remaining: number;
  max: number;
}> = ({ resource, remaining, max }) => {
  return (
    <SecondaryCard className="w-full space-y-1">
      <p className="text-xs opacity-75 mb-1">RESOURCES REMAINING</p>
      <Progress value={remaining} max={max} className="w-full" />

      <div className="flex justify-between text-xs opacity-75 px-1">
        <IconLabel
          imageUri={ResourceImage.get(resource) ?? ""}
          text={getBlockTypeName(resource)}
        />
        <p>
          {formatNumber(remaining * RESOURCE_SCALE)}/
          {formatNumber(max * RESOURCE_SCALE)}
        </p>
      </div>
    </SecondaryCard>
  );
};
