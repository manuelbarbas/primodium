import { useMemo } from "react";
import { EntityID } from "@latticexyz/recs";
import { getBuildingName } from "src/util/building";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";

export const DroneFactory: React.FC<{ building: EntityID }> = ({
  building,
}) => {
  const buildingName = useMemo(() => {
    if (!building) return;

    return getBuildingName(building);
  }, [building]);

  if (!buildingName) return null;

  return (
    <Navigator.Screen title={buildingName} className="w-fit">
      <Header building={building} />
      <Upgrade building={building} />
    </Navigator.Screen>
  );
};
