import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Progress } from "src/components/core/Progress";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceEntityLookup, ResourceImage } from "src/util/constants";

export const MotherlodeMaterial = () => {
  const selectedMotherlode = components.SelectedRock.use()?.value as Entity | undefined;
  const motherlodeResource = (components.Motherlode.use(selectedMotherlode)?.motherlodeType ??
    EResource.Iron) as EResource;
  const resourceId = ResourceEntityLookup[motherlodeResource];
  const rawResource = components.P_RawResource.useWithKeys({ resource: motherlodeResource })?.value;

  const { resourceCount, resourceStorage } = useFullResourceCount(
    ResourceEntityLookup[(rawResource as EResource) ?? EResource.Iron],
    selectedMotherlode
  );
  if (!selectedMotherlode || !rawResource) return null;

  return (
    <div className="w-full flex flex-col items-center my-3">
      <p className="font-bold text-xs pb-1"> MINABLE RESOURCES </p>
      <SecondaryCard className="w-96 pt-5">
        <Progress value={Number(resourceCount)} max={Number(resourceStorage)} className="w-full progress-accent mb-1" />
        <div className="flex justify-between text-xs w-full">
          <IconLabel imageUri={ResourceImage.get(resourceId) ?? ""} text={getBlockTypeName(resourceId)} />
          <p>
            {(resourceCount / RESOURCE_SCALE).toString()}/{(resourceStorage / RESOURCE_SCALE).toString()}
          </p>
        </div>
      </SecondaryCard>
    </div>
  );
};
