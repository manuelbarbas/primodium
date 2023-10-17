import { Navigator } from "src/components/core/Navigator";
import { ResearchItem } from "../widgets/ResearchItem";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";

export const UpgradeUnit: React.FC<{ building: Entity }> = ({ building }) => {
  const buildingType = useMemo(() => {
    if (!building) return;

    return components.BuildingType.get(building)?.value;
  }, [building]);

  return (
    <Navigator.Screen title="UpgradeUnit" className="flex items-center">
      <div className="grid grid-cols-2 w-full mb-2 gap-1">
        {EntityType.DroneFactory === buildingType && (
          <>
            <ResearchItem type={EntityType.AnvilLightDrone} />
            <ResearchItem type={EntityType.HammerLightDrone} />
            <ResearchItem type={EntityType.StingerDrone} />
            <ResearchItem type={EntityType.AegisDrone} />
          </>
        )}
        {EntityType.Workshop === buildingType && (
          <>
            <ResearchItem type={EntityType.MinutemanMarine} />
            <ResearchItem type={EntityType.TridentMarine} />
          </>
        )}
      </div>

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
