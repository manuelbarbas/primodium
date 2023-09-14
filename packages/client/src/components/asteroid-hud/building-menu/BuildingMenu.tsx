import { useMemo } from "react";
import { Navigator } from "src/components/core/Navigator";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { getBuildingName } from "src/util/building";

export const BuildingMenu: React.FC = () => {
  const selectedBuilding = SelectedBuilding.use()?.value;

  const buildingName = useMemo(() => {
    if (!selectedBuilding) return;

    return getBuildingName(selectedBuilding);
  }, [selectedBuilding]);

  if (!buildingName) return null;

  return (
    <Navigator initialScreen={buildingName}>
      <Navigator.Breadcrumbs />
      <Navigator.Screen title={buildingName}>This is a test</Navigator.Screen>
      <Navigator.BackButton />
    </Navigator>
  );
};
