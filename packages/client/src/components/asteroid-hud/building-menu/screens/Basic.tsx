import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { getBuildingName } from "src/util/building";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";

export const Basic: React.FC<{ building: EntityID }> = ({ building }) => {
  const buildingName = useMemo(() => {
    if (!building) return;

    return getBuildingName(building);
  }, [building]);

  console.log(buildingName);

  if (!buildingName) return null;

  return (
    <Navigator.Screen title={buildingName}>
      <Header building={building} />
    </Navigator.Screen>
  );
};
