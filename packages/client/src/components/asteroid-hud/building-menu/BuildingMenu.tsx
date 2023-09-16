import { useMemo } from "react";
import { Navigator } from "src/components/core/Navigator";
import { BuildingType } from "src/network/components/chainComponents";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { getBuildingName } from "src/util/building";
import { BlockType } from "src/util/constants";
import { Basic } from "./screens/Basic";
import { MainBase } from "./screens/Mainbase";

export const BuildingMenu: React.FC = () => {
  const selectedBuilding = SelectedBuilding.use()?.value;

  const buildingType = useMemo(() => {
    if (!selectedBuilding) return;

    return BuildingType.get(selectedBuilding)?.value;
  }, [selectedBuilding]);

  const buildingName = useMemo(() => {
    if (!selectedBuilding) return;

    return getBuildingName(selectedBuilding);
  }, [selectedBuilding]);

  if (!buildingName || !selectedBuilding) return null;

  const renderScreen = () => {
    switch (buildingType) {
      case BlockType.MainBase:
        return <MainBase building={selectedBuilding} />;
      case BlockType.DroneFactory:
        return null;
      default:
        return <Basic building={selectedBuilding} />;
    }
  };

  return (
    <Navigator initialScreen={buildingName}>
      {/* <Navigator.Breadcrumbs /> */}
      {renderScreen()}
      <Navigator.BackButton />
    </Navigator>
  );
};
