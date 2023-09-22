import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { getBuildingName } from "src/util/building";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";

export const Basic: React.FC<{ building: EntityID }> = ({ building }) => {
  const buildingName = useMemo(() => {
    if (!building) return;

    return getBuildingName(building);
  }, [building]);

  if (!buildingName) return null;

  return (
    <Navigator.Screen title={buildingName}>
      <Header building={building} />
      <Upgrade building={building} />
      <Navigator.NavButton className="btn-error btn-sm m-1" to="Demolish">
        Demolish Building
      </Navigator.NavButton>
    </Navigator.Screen>
  );
};
