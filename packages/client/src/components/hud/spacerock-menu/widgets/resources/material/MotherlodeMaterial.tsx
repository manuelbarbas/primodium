import { Entity } from "@latticexyz/recs";
import { Fragment } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage } from "src/util/constants";

export const MotherlodeMaterial = () => {
  const selectedMotherlode = components.SelectedRock.use()?.value as Entity | undefined;

  const resources = useFullResourceCounts(selectedMotherlode);
  if (!selectedMotherlode) return null;

  return (
    <div className="w-full flex flex-col items-center my-3">
      <p className="font-bold text-xs pb-1"> MINABLE RESOURCES </p>
      <SecondaryCard className="w-96 pt-5">
        {[...resources.entries()].map(([resourceId, data]) => (
          <Fragment key={`resource-${resourceId}`}>
            <Progress
              value={Number(data.resourceCount)}
              max={Number(data.resourceStorage)}
              className="w-full progress-accent mb-1"
            />
            <div className="flex justify-between text-xs w-full">
              <IconLabel imageUri={ResourceImage.get(resourceId) ?? ""} text={getBlockTypeName(resourceId)} />
              <p>
                {(data.resourceCount / RESOURCE_SCALE).toString()}/{(data.resourceStorage / RESOURCE_SCALE).toString()}
              </p>
            </div>
          </Fragment>
        ))}
      </SecondaryCard>
    </div>
  );
};
