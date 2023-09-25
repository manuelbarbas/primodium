import { useEffect, useMemo } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { BuildingType } from "src/network/components/chainComponents";
import { SelectedBuilding } from "src/network/components/clientComponents";
import { getBuildingName } from "src/util/building";
import { BlockType } from "src/util/constants";
import { Basic } from "./screens/Basic";
import { BuildingInfo } from "./screens/BuildingInfo";
import { Demolish } from "./screens/Demolish";
import { DroneFactory } from "./screens/DroneFactory";
import { MainBase } from "./screens/Mainbase";
import { BuildQueue } from "./screens/BuildQueue";
import { BuildDrone } from "./screens/BuildDrone";
import { UpgradeDrones } from "./screens/UpgradeDrones";
import { FaTrash } from "react-icons/fa";
import { MiningVessels } from "./screens/MiningVessels";

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

  useEffect(() => {
    const removeSelectedBuildingOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        SelectedBuilding.remove();
      }
    };

    document.addEventListener("keydown", removeSelectedBuildingOnEscape);

    return () => {
      document.removeEventListener("keydown", removeSelectedBuildingOnEscape);
    };
  }, []);

  if (!buildingName || !selectedBuilding) return null;

  const renderScreen = () => {
    switch (buildingType) {
      case BlockType.MainBase:
        return <MainBase building={selectedBuilding} />;
      case BlockType.DroneFactory:
        return <DroneFactory building={selectedBuilding} />;
      default:
        return <Basic building={selectedBuilding} />;
    }
  };

  return (
    <Navigator initialScreen={buildingName} className="w-120">
      {/* <Navigator.Breadcrumbs /> */}

      {/* Initial Screen */}
      {renderScreen()}

      {/* Sub Screens */}
      <Demolish building={selectedBuilding} />
      <BuildingInfo building={selectedBuilding} />
      <BuildQueue building={selectedBuilding} />
      <BuildDrone building={selectedBuilding} />
      <UpgradeDrones />
      <MiningVessels building={selectedBuilding} />

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
        <Button
          className="btn-square btn-sm font-bold border border-secondary"
          onClick={() => SelectedBuilding.remove()}
        >
          x
        </Button>
      </div>

      {buildingType !== BlockType.MainBase && (
        <div className="absolute top-0 right-9 -translate-y-1/2 translate-x-1/2">
          <Navigator.NavButton
            className=" btn-square btn-sm font-bold border border-error inline-flex"
            to="Demolish"
          >
            <FaTrash size={12} />
          </Navigator.NavButton>
        </div>
      )}
    </Navigator>
  );
};
