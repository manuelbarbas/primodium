import { Navigator } from "src/components/core/Navigator";
import { ResearchItem } from "../widgets/ResearchItem";
import {
  AegisDroneUpgradeTree,
  AnvilDroneUpgradeTree,
  HammerDroneUpgradeTree,
  TridentMarineUpgradeTree,
  MinutemanMarineUpgradeTree,
  StingerDroneUpgradeTree,
} from "src/util/research";
import { EntityID } from "@latticexyz/recs";
import { BuildingType } from "src/network/components/chainComponents";
import { useMemo } from "react";
import { EntityType } from "src/util/constants";

export const UpgradeUnit: React.FC<{ building: EntityID }> = ({ building }) => {
  const buildingType = useMemo(() => {
    if (!building) return;

    return BuildingType.get(building)?.value;
  }, [building]);

  return (
    <Navigator.Screen title="UpgradeUnit" className="flex items-center">
      <div className="grid grid-cols-2 w-full mb-2 gap-1">
        {EntityType.DroneFactory === buildingType && (
          <>
            <ResearchItem data={AnvilDroneUpgradeTree} />
            <ResearchItem data={HammerDroneUpgradeTree} />
            <ResearchItem data={StingerDroneUpgradeTree} />
            <ResearchItem data={AegisDroneUpgradeTree} />
          </>
        )}
        {EntityType.Workshop === buildingType && (
          <>
            <ResearchItem data={MinutemanMarineUpgradeTree} />
            <ResearchItem data={TridentMarineUpgradeTree} />
          </>
        )}
      </div>

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
