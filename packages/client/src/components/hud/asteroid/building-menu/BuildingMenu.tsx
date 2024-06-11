import { Badge } from "@/components/core/Badge";
import { Shipyard } from "@/components/hud/asteroid/building-menu/screens/shipyard/Shipyard";
import { CommissionColonyShips } from "@/components/hud/global/modals/colony-ships/CommissionColonyShips";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { useBuildingInfo } from "@/react/hooks/useBuildingInfo";
import { useGame } from "@/react/hooks/useGame";
import { getBuildingImage } from "@/util/building";
import { getEntityTypeName, toRomanNumeral } from "@/util/common";
import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { FaArrowsAlt, FaInfoCircle, FaPowerOff, FaTimes, FaTrash } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { toggleBuilding } from "src/network/setup/contractCalls/toggleBuilding";
import { Action, EntityType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Basic } from "./screens/Basic";
import { BuildQueue } from "./screens/BuildQueue";
import { BuildUnit } from "./screens/BuildUnit";
import { BuildingInfo } from "./screens/BuildingInfo";
import { Demolish } from "./screens/Demolish";
import { MainBase } from "./screens/Mainbase";
import { Market } from "./screens/Market";
import { Move } from "./screens/Move";
import { UnitFactory } from "./screens/UnitFactory";
import { WormholeBase } from "./screens/WormholeBase";

export const BuildingMenu: React.FC<{ selectedBuilding: Entity }> = ({ selectedBuilding }) => {
  const buildingType = useMemo(() => {
    return components.BuildingType.get(selectedBuilding)?.value as Entity | undefined;
  }, [selectedBuilding]);

  const handleClose = () => {
    components.SelectedBuilding.remove();
    components.SelectedAction.remove();
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
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Move, selectedBuilding)}>
              <Navigator.NavButton
                tooltip="Move"
                tooltipDirection="top"
                className=" btn-square btn-xs font-bold border border-secondary inline-flex"
                to="Move"
                onClick={() => components.SelectedAction.set({ value: Action.MoveBuilding })}
              >
                <FaArrowsAlt size={12} />
              </Navigator.NavButton>
            </TransactionQueueMask>
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Demolish, selectedBuilding)}>
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
    const game = useGame();
    const buildingImage = getBuildingImage(game, selectedBuilding);
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
  const mud = useMud();
  const active = components.IsActive.use(buildingEntity)?.value;
  const canToggle = !components.TrainingQueue.use(buildingEntity)?.units.length;

  return (
    <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Toggle, buildingEntity)}>
      <Button
        tooltip={active ? "Deactivate" : "Activate"}
        disabled={!canToggle}
        tooltipDirection="top"
        className={`btn-square btn-xs font-bold border ${active ? "border-error" : "border-success"} inline-flex`}
        onClick={() => toggleBuilding(mud, buildingEntity)}
      >
        <FaPowerOff size={12} />
      </Button>
    </TransactionQueueMask>
  );
};
