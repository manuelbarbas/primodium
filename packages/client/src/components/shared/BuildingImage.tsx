import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { getBuildingImage, getBuildingImageFromType } from "src/util/building";

export const BuildingImage: React.FC<{ building: Entity }> = ({ building }) => {
  const primodium = usePrimodium();
  const imageUri = useMemo(() => getBuildingImage(primodium, building), [primodium, building]);

  return (
    <div
      className={`relative flex flex-col text-sm items-center cursor-pointer min-w-[4rem] h-12 border rounded border-cyan-400`}
    >
      <img src={imageUri} className={`absolute bottom-0 w-14 pixel-images rounded-md`} />
    </div>
  );
};

export const BuildingImageFromType: React.FC<{ buildingType: Entity; blurred?: boolean }> = ({
  buildingType,
  blurred,
}) => {
  const primodium = usePrimodium();
  const imageUri = useMemo(() => getBuildingImageFromType(primodium, buildingType), [primodium, buildingType]);

  return (
    <div className={`relative flex flex-col text-sm items-center cursor-pointer min-w-[4rem] h-12`}>
      <img
        src={imageUri}
        className={`absolute pointer-events-none bottom-0 w-14 pixel-images rounded-md ${
          blurred ? "darken-[3px]" : ""
        }`}
      />
    </div>
  );
};
