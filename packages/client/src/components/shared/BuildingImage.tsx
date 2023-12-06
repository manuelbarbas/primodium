import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { getBuildingImageFromType, getBuildingImage } from "src/util/building";

export const BuildingImage: React.FC<{ building: Entity }> = ({ building }) => {
  const imageUri = useMemo(() => getBuildingImage(building), [building]);

  return (
    <div
      className={`relative flex flex-col text-sm items-center cursor-pointer min-w-[4rem] h-12 border rounded border-cyan-400`}
    >
      <img src={imageUri} className={`absolute bottom-0 w-14 pixel-images rounded-md`} />
    </div>
  );
};

export const BuildingImageFromType: React.FC<{ buildingType: Entity }> = ({ buildingType }) => {
  const imageUri = useMemo(() => getBuildingImageFromType(buildingType), [buildingType]);

  return (
    <div className={`relative flex flex-col text-sm items-center cursor-pointer min-w-[4rem] h-12`}>
      <img src={imageUri} className={`absolute pointer-events-none bottom-0 w-14 pixel-images rounded-md`} />
    </div>
  );
};
