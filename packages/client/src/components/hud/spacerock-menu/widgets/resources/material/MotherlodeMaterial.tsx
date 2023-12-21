import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESOURCE_SCALE, ResourceEntityLookup, ResourceImage } from "src/util/constants";

export const MotherlodeMaterial = () => {
  const selectedMotherlode = components.SelectedRock.use()?.value as Entity | undefined;

  const motherlodeType =
    (components.Motherlode.use(selectedMotherlode)?.motherlodeType as EResource) ?? EntityType.Iridium;
  const resource = ResourceEntityLookup[motherlodeType];
  const { resourceCount, resourceStorage } = useFullResourceCount(resource, selectedMotherlode);
  if (!selectedMotherlode || !motherlodeType) return null;

  return (
    <div className="w-full flex flex-col items-center my-3">
      <p className="font-bold text-xs pb-1"> MINABLE RESOURCES </p>
      <SecondaryCard className="w-96 pt-5">
        <Progress value={Number(resourceCount)} max={Number(resourceStorage)} className="w-full progress-accent mb-1" />
        <div className="flex justify-between text-xs w-full">
          <IconLabel imageUri={ResourceImage.get(resource) ?? ""} text={getBlockTypeName(resource)} />
          <p>
            {(resourceCount / RESOURCE_SCALE).toString()}/{(resourceStorage / RESOURCE_SCALE).toString()}
          </p>
        </div>
      </SecondaryCard>
    </div>
  );
};
