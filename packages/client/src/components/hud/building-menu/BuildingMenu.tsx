import { useEffect, useMemo } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { getBuildingName } from "src/util/building";
import { EntityType } from "src/util/constants";
import { Basic } from "./screens/Basic";
import { BuildingInfo } from "./screens/BuildingInfo";
import { Demolish } from "./screens/Demolish";
// import { UnitFactory } from "./screens/UnitFactory";
import { BuildQueue } from "./screens/BuildQueue";
import { BuildUnit } from "./screens/BuildUnit";
import { MainBase } from "./screens/Mainbase";
// import { UpgradeUnit } from "./screens/UpgradeUnit";
import { FaTrash } from "react-icons/fa";
import { components } from "src/network/components";
import { MiningVessels } from "./screens/MiningVessels";
import { UnitFactory } from "./screens/UnitFactory";
import { UpgradeUnit } from "./screens/UpgradeUnit";

export const BuildingMenu: React.FC = () => {
  const selectedBuilding = components.SelectedBuilding.use()?.value;

  const buildingType = useMemo(() => {
    if (!selectedBuilding) return;

    return components.BuildingType.get(selectedBuilding)?.value;
  }, [selectedBuilding]);

  const buildingName = useMemo(() => {
    if (!selectedBuilding) return;

    return getBuildingName(selectedBuilding);
  }, [selectedBuilding]);

  useEffect(() => {
    const removeSelectedBuildingOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        components.SelectedBuilding.remove();
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
      case EntityType.MainBase:
        return <MainBase building={selectedBuilding} />;
      case EntityType.DroneFactory:
        return <UnitFactory building={selectedBuilding} />;
      // case EntityType.Workshop:
      //   return <UnitFactory building={selectedBuilding} />;
      default:
        return <Basic building={selectedBuilding} />;
    }
  };

  return (
    <Navigator initialScreen={selectedBuilding} className="w-120">
      {/* <Navigator.Breadcrumbs /> */}

      {/* Initial Screen */}
      {renderScreen()}

      {/* Sub Screens */}
      <Demolish building={selectedBuilding} />
      <BuildingInfo building={selectedBuilding} />
      <BuildQueue building={selectedBuilding} />
      <BuildUnit building={selectedBuilding} />
      <UpgradeUnit building={selectedBuilding} />
      <MiningVessels building={selectedBuilding} />

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
        <Button
          className="btn-square btn-sm font-bold border border-secondary"
          onClick={() => components.SelectedBuilding.remove()}
        >
          x
        </Button>
      </div>

      {buildingType !== EntityType.MainBase && (
        <div className="absolute top-0 right-9 -translate-y-1/2 translate-x-1/2">
          <Navigator.NavButton className=" btn-square btn-sm font-bold border border-error inline-flex" to="Demolish">
            <FaTrash size={12} />
          </Navigator.NavButton>
        </div>
      )}
    </Navigator>
  );
};
