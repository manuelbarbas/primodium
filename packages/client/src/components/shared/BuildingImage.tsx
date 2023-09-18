import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { getBuildingInfo } from "src/util/building";

export const BuildingImage: React.FC<{ building: EntityID }> = ({
  building,
}) => {
  const buildingInfo = useMemo(() => {
    return getBuildingInfo(building);
  }, [building]);

  if (!buildingInfo) return null;

  return (
    <div
      className={`relative flex flex-col text-sm items-center cursor-pointer min-w-[4rem] h-12 border rounded border-cyan-400`}
    >
      <img
        src={buildingInfo.imageUri}
        className={`absolute bottom-0 w-14 pixel-images rounded-md`}
      />
    </div>
  );
};
