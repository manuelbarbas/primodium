import { useEffect, useMemo } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { Action, EntityType, TransactionQueueType } from "src/util/constants";
import { Basic } from "./screens/Basic";
import { BuildingInfo } from "./screens/BuildingInfo";
import { Demolish } from "./screens/Demolish";
// import { UnitFactory } from "./screens/UnitFactory";
import { BuildQueue } from "./screens/BuildQueue";
import { BuildUnit } from "./screens/BuildUnit";
import { MainBase } from "./screens/Mainbase";
// import { UpgradeUnit } from "./screens/UpgradeUnit";
import { FaArrowsAlt, FaTrash } from "react-icons/fa";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useBuildingName } from "src/hooks/useBuildingName";
import { components } from "src/network/components";
import { hashEntities } from "src/util/encode";
import { MiningVessels } from "./screens/MiningVessels";
import { Move } from "./screens/Move";
import { UnitFactory } from "./screens/UnitFactory";
import { UpgradeUnit } from "./screens/UpgradeUnit";
import { toggleBuilding } from "src/util/web3/contractCalls/toggleBuilding";
import { useMud } from "src/hooks";

export const BuildingMenu: React.FC = () => {
  const network = useMud().network;
  const selectedBuilding = components.SelectedBuilding.use()?.value;

  const buildingType = useMemo(() => {
    if (!selectedBuilding) return;

    return components.BuildingType.get(selectedBuilding)?.value;
  }, [selectedBuilding]);

  const buildingName = useBuildingName(selectedBuilding);

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

  const handleClose = () => {
    components.SelectedBuilding.remove();
    components.SelectedAction.remove();
  };

  const renderScreen = () => {
    switch (buildingType) {
      case EntityType.MainBase:
        return <MainBase building={selectedBuilding} />;
      case EntityType.DroneFactory:
        return <UnitFactory building={selectedBuilding} />;
      case EntityType.Workshop:
        return <UnitFactory building={selectedBuilding} />;
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
      <Move building={selectedBuilding} />
      <Demolish building={selectedBuilding} />
      <BuildingInfo building={selectedBuilding} />
      <BuildQueue building={selectedBuilding} />
      <BuildUnit building={selectedBuilding} />
      <UpgradeUnit building={selectedBuilding} />
      <MiningVessels building={selectedBuilding} />

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
        <Button
          tooltip="Close"
          tooltipDirection="top"
          className="btn-square btn-sm font-bold border border-secondary"
          onClick={handleClose}
        >
          x
        </Button>
      </div>

      {buildingType !== EntityType.MainBase && (
        <>
          <div className="absolute top-0 right-[4.5rem] -translate-y-1/2 translate-x-1/2">
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Build, selectedBuilding)}>
              <Navigator.NavButton
                tooltip="Move"
                tooltipDirection="top"
                className=" btn-square btn-sm font-bold border border-secondary inline-flex"
                to="Move"
                onClick={() => components.SelectedAction.set({ value: Action.MoveBuilding })}
              >
                <FaArrowsAlt size={12} />
              </Navigator.NavButton>
            </TransactionQueueMask>
          </div>

          <div className="absolute top-0 right-9 -translate-y-1/2 translate-x-1/2">
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Demolish, selectedBuilding)}>
              <Navigator.NavButton
                tooltip="Demolish"
                tooltipDirection="top"
                className="btn-square btn-sm font-bold border border-error inline-flex"
                to="Demolish"
              >
                <FaTrash size={12} />
              </Navigator.NavButton>
            </TransactionQueueMask>
          </div>

          <div className="absolute top-0 right-[7rem] -translate-y-1/2 translate-x-1/2">
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Toggle, selectedBuilding)}>
              <Button
                disabled={false}
                className="btn-square btn-sm font-bold border border-error inline-flex"
                onClick={() => {
                  toggleBuilding(selectedBuilding, network);
                  //components.SelectedBuilding.remove();
                }}
              >
                {" "}
              </Button>
            </TransactionQueueMask>
          </div>
        </>
      )}
    </Navigator>
  );
};
