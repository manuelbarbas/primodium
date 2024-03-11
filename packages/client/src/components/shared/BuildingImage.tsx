import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { getBuildingImageFromType } from "src/util/building";

export const BuildingImageFromType: React.FC<{ buildingType: Entity; blurred?: boolean }> = ({
  buildingType,
  blurred,
}) => {
  const primodium = usePrimodium();
  const imageUri = useMemo(() => getBuildingImageFromType(primodium, buildingType), [primodium, buildingType]);

  return (
    <div className={`relative flex flex-col items-center cursor-pointer h-11`}>
      <img
        src={imageUri}
        className={`absolute bottom-0 pointer-events-none w-[1em] pixel-images rounded-md ${
          blurred ? "darken-[3px]" : ""
        }`}
      />
    </div>
  );
};

export const BlueprintBuildingImageFromType: React.FC<{ buildingType: Entity; blurred?: boolean }> = ({
  buildingType,
  blurred,
}) => {
  const primodium = usePrimodium();
  const imageUri = useMemo(() => getBuildingImageFromType(primodium, buildingType), [primodium, buildingType]);

  return (
    <div className={`flex flex-col place-items-center cursor-pointer w-[110%]`}>
      <img
        src={imageUri}
        className={`pointer-events-none pixel-images rounded-md -mt-4 -ml-1 ${
          blurred ? "darken-[3px]" : ""
        }`}
      />
    </div>
  );
};