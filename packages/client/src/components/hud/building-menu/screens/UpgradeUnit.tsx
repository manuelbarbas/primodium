import { Navigator } from "src/components/core/Navigator";
import { ResearchItem } from "../widgets/ResearchItem";
import {
  AdvancedMarineUnitUpgradeTree,
  AegisDroneUpgradeTree,
  AnvilDroneUpgradeTree,
  HammerDroneUpgradeTree,
  MarineUnitUpgradeTree,
  StingerDroneUpgradeTree,
} from "src/util/research";
import { EntityID } from "@latticexyz/recs";
import { BuildingType } from "src/network/components/chainComponents";
import { useMemo } from "react";
import { BlockType } from "src/util/constants";

export const UpgradeUnit: React.FC<{ building: EntityID }> = ({ building }) => {
  const buildingType = useMemo(() => {
    if (!building) return;

    return BuildingType.get(building)?.value;
  }, [building]);

  return (
    <Navigator.Screen title="UpgradeUnit" className="flex items-center">
      <div className="grid grid-cols-2 w-full mb-2 gap-1">
        {BlockType.DroneFactory === buildingType && (
          <>
            <ResearchItem data={AnvilDroneUpgradeTree} />
            <ResearchItem data={HammerDroneUpgradeTree} />
            <ResearchItem data={StingerDroneUpgradeTree} />
            <ResearchItem data={AegisDroneUpgradeTree} />
          </>
        )}
        {BlockType.Workshop === buildingType && (
          <>
            <ResearchItem data={MarineUnitUpgradeTree} />
            <ResearchItem data={AdvancedMarineUnitUpgradeTree} />
          </>
        )}
      </div>

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
