import { useMemo } from "react";
import { FaArrowsAlt, FaInfoCircle, FaPowerOff, FaTimes, FaTrash } from "react-icons/fa";

import { Action, EntityType, getEntityTypeName, toRomanNumeral } from "@primodiumxyz/core";
import { useBuildingInfo, useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { Navigator } from "@/components/core/Navigator";
import { Shipyard } from "@/components/hud/asteroid/building-menu/screens/shipyard/Shipyard";
import { CommissionColonyShips } from "@/components/hud/global/modals/colony-ships/CommissionColonyShips";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useBuildingImage } from "@/hooks/image/useBuildingImage";
import { useContractCalls } from "@/hooks/useContractCalls";
import { EntityToResourceImage } from "@/util/image";

import { Basic } from "./screens/Basic";
import { BuildingInfo } from "./screens/BuildingInfo";
import { BuildQueue } from "./screens/BuildQueue";
import { BuildUnit } from "./screens/BuildUnit";
import { Demolish } from "./screens/Demolish";
import { MainBase } from "./screens/Mainbase";
import { Market } from "./screens/Market";
import { Move } from "./screens/Move";
import { UnitFactory } from "./screens/UnitFactory";
import { WormholeBase } from "./screens/WormholeBase";

export const BuildingMenu: React.FC<{ selectedBuilding: Entity }> = ({ selectedBuilding }) => {
  const { tables } = useCore();
  const buildingType = useMemo(() => {
    return tables.BuildingType.get(selectedBuilding)?.value as Entity | undefined;
  }, [selectedBuilding]);

  const handleClose = () => {
    tables.SelectedBuilding.remove();
    tables.SelectedAction.remove();
  };

  const RenderScreen = () => {
    switch (buildingType) {
      case EntityType.MainBase:
        return <MainBase building={selectedBuilding} />;
      case EntityType.WormholeBase:
        return <WormholeBase building={selectedBuilding} />;
      case EntityType.DroneFactory:
      case EntityType.Workshop:
        return <UnitFactory building={selectedBuilding} />;
      case EntityType.Shipyard:
        return <Shipyard building={selectedBuilding} />;
      case EntityType.Market:
        return <Market building={selectedBuilding} />;
      default:
        return <Basic building={selectedBuilding} />;
    }
  };
  const TopBar = () => {
    return (
      <div className="absolute -top-6 -right-7 -translate-y-full flex flex-row-reverse gap-1 p-1 border-secondary border-b-base-100 scale-90">
        <Button
          tooltip="Close"
          tooltipDirection="top"
          className="btn-square btn-xs font-bold border border-secondary"
          onClick={handleClose}
        >
          <FaTimes />
        </Button>
        {buildingType !== EntityType.MainBase && buildingType !== EntityType.WormholeBase && (
          <>
            <TransactionQueueMask queueItemId={`move-${selectedBuilding}`}>
              <Navigator.NavButton
                tooltip="Move"
                tooltipDirection="top"
                className=" btn-square btn-xs font-bold border border-secondary inline-flex"
                to="Move"
                onClick={() => tables.SelectedAction.set({ value: Action.MoveBuilding })}
              >
                <FaArrowsAlt size={12} />
              </Navigator.NavButton>
            </TransactionQueueMask>
            <TransactionQueueMask queueItemId={`demolish-${selectedBuilding}`}>
              <Navigator.NavButton
                tooltip="Demolish"
                tooltipDirection="top"
                className="btn-square btn-xs font-bold border border-error inline-flex"
                to="Demolish"
              >
                <FaTrash size={12} />
              </Navigator.NavButton>
            </TransactionQueueMask>

            <ToggleButton buildingEntity={selectedBuilding} />
          </>
        )}
      </div>
    );
  };

  const Header = () => {
    const buildingImage = useBuildingImage(selectedBuilding);
    const buildingName = buildingType ? getEntityTypeName(buildingType) : "";
    const info = useBuildingInfo(selectedBuilding);

    return (
      <div className="flex gap-2 items-center relative">
        <img src={buildingImage} className="h-16" />
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 items-center justify-center">
            <p>
              {buildingName} {toRomanNumeral(Number(info.level))}
            </p>
            <Navigator.NavButton
              to="BuildingInfo"
              variant="ghost"
              className="btn-xs btn-ghost flex gap-2 w-fit opacity-75"
            >
              <FaInfoCircle />
            </Navigator.NavButton>
          </div>
          {info.production.map(({ resource, amount, type }) => (
            <Badge key={`buildingproduction-${resource}`} className="text-xs gap-2 bg-base-100 py-2 text-success">
              <ResourceIconTooltip
                name={getEntityTypeName(resource)}
                image={EntityToResourceImage[resource] ?? ""}
                resource={resource}
                amount={amount}
                resourceType={type}
                short
                fractionDigits={1}
              />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Navigator
      initialScreen={selectedBuilding}
      className="border-none p-0 relative overflow-visible flex flex-col gap-2"
    >
      <TopBar />
      <Header />
      {/* Initial Screen */}
      <RenderScreen />
      {/* Sub Screens */}
      <Demolish building={selectedBuilding} />
      <Move building={selectedBuilding} />
      <BuildingInfo building={selectedBuilding} />

      {/* Unit Training */}
      <BuildQueue building={selectedBuilding} />
      <BuildUnit building={selectedBuilding} />

      {/* Colony Ship */}
      <CommissionColonyShips buildingEntity={selectedBuilding} />
    </Navigator>
  );
};

const ToggleButton = ({ buildingEntity }: { buildingEntity: Entity }) => {
  const { tables } = useCore();
  const { toggleBuilding } = useContractCalls();
  const active = tables.IsActive.use(buildingEntity)?.value;
  const canToggle = !tables.TrainingQueue.use(buildingEntity)?.units.length;

  return (
    <TransactionQueueMask queueItemId={`toggle-${buildingEntity}`}>
      <Button
        tooltip={active ? "Deactivate" : "Activate"}
        disabled={!canToggle}
        tooltipDirection="top"
        className={`btn-square btn-xs font-bold border ${active ? "border-error" : "border-success"} inline-flex`}
        onClick={() => toggleBuilding(buildingEntity)}
      >
        <FaPowerOff size={12} />
      </Button>
    </TransactionQueueMask>
  );
};
