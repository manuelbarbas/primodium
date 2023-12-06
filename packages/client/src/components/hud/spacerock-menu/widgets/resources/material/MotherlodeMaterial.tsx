import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage } from "src/util/constants";
import { getMotherlodeResource } from "src/util/resource";

export const MotherlodeMaterial = () => {
  const selectedMotherlode = components.SelectedRock.use()?.value as Entity | undefined;
  const motherlodeResource = getMotherlodeResource(selectedMotherlode ?? singletonEntity);

  return (
    <div className="w-full flex flex-col items-center my-3">
      <p className="font-bold text-xs pb-1"> MINABLE RESOURCES </p>
      <SecondaryCard className="w-full pt-5">
        <Progress value={50} max={100} className="w-full progress-accent mb-1" />
        <div className="flex justify-between text-xs w-full">
          <IconLabel
            imageUri={ResourceImage.get(motherlodeResource) ?? ""}
            text={getBlockTypeName(motherlodeResource)}
          />
          <p>50/100</p>
        </div>
      </SecondaryCard>
    </div>
  );
};
