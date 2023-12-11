import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaLock } from "react-icons/fa";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";
import { Button } from "../core/Button";
import { Card, SecondaryCard } from "../core/Card";
import { BuildingImageFromType } from "../shared/BuildingImage";
import { BlueprintInfo } from "./BlueprintInfo";

const Blueprint: React.FC<{
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
}> = ({ buildingType, tooltipDirection }) => {
  const player = components.Account.use()?.value ?? singletonEntity;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const mainbaseLevel =
    components.Level.use((components.Home.use(player)?.mainBase ?? singletonEntity) as Entity)?.value ?? 1n;
  const levelRequirement =
    components.P_RequiredBaseLevel.getWithKeys({ prototype: buildingType as Hex, level: 1n })?.value ?? 1n;
  const hasMainbaseLevel = mainbaseLevel >= levelRequirement;

  const hasEnough = useHasEnoughResources(getRecipe(buildingType, 1n));
  return (
    <Button
      disabled={mainbaseLevel < levelRequirement}
      tooltip={getBlockTypeName(buildingType)}
      tooltipDirection={tooltipDirection ?? "right"}
      onClick={() => {
        if (selectedBuilding === buildingType) {
          components.SelectedBuilding.remove();
          components.SelectedAction.remove();
          return;
        }
        components.SelectedBuilding.set({ value: buildingType });
        components.SelectedAction.set({ value: Action.PlaceBuilding });
      }}
      className={`relative btn-ghost w-fit p-0 ${
        hasMainbaseLevel
          ? hasEnough
            ? "hover:bg-accent border-accent/50"
            : "hover:bg-warning border-warning/75"
          : "hover:bg-error border-error/75"
      } disabled:opacity-50 border border-secondary hover:z-10 ${
        selectedBuilding === buildingType ? " ring-2 ring-white/75" : ""
      }`}
    >
      <BuildingImageFromType buildingType={buildingType} />
      {!hasMainbaseLevel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-error flex text-xs bg">
          <p className="bg-neutral flex gap-1">
            <FaLock /> LVL. {levelRequirement.toString()}
          </p>
        </div>
      )}
    </Button>
  );
};

export const Blueprints = () => {
  const selectedBuilding = components.SelectedBuilding.use()?.value;

  return (
    <>
      <div className="flex h-fit w-full gap-1 items-start">
        <SecondaryCard className="gap-2 items-center">
          <p className="text-xs opacity-50 font-bold pb-2">BASIC</p>
          <Blueprint buildingType={EntityType.IronMine} />
          <Blueprint buildingType={EntityType.CopperMine} />
          <Blueprint buildingType={EntityType.LithiumMine} />
          <Blueprint buildingType={EntityType.SulfurMine} />
          <Blueprint buildingType={EntityType.Garage} />
          <Blueprint buildingType={EntityType.Workshop} />
        </SecondaryCard>
        <SecondaryCard className="gap-2 items-center">
          <p className="text-xs opacity-50 font-bold pb-2">ADVANCED</p>
          <Blueprint tooltipDirection="top" buildingType={EntityType.StorageUnit} />
          <Blueprint tooltipDirection="top" buildingType={EntityType.SolarPanel} />
          <Blueprint tooltipDirection="top" buildingType={EntityType.DroneFactory} />
          <Blueprint tooltipDirection="top" buildingType={EntityType.IronPlateFactory} />
          <Blueprint tooltipDirection="top" buildingType={EntityType.PVCellFactory} />
          <Blueprint tooltipDirection="top" buildingType={EntityType.Vault} />
        </SecondaryCard>
        <SecondaryCard className="gap-2 items-center">
          <p className="text-xs opacity-50 font-bold pb-2">ELITE</p>
          <Blueprint tooltipDirection="left" buildingType={EntityType.SAMLauncher} />
          <Blueprint tooltipDirection="left" buildingType={EntityType.Hangar} />
          <Blueprint tooltipDirection="left" buildingType={EntityType.AlloyFactory} />
          <Blueprint tooltipDirection="left" buildingType={EntityType.StarmapperStation} />
          <Blueprint tooltipDirection="left" buildingType={EntityType.ShieldGenerator} />
          <Blueprint tooltipDirection="left" buildingType={EntityType.Market} />
        </SecondaryCard>
      </div>
      {selectedBuilding && (
        <Card className="absolute card top-0 left-0 -translate-y-full w-full -translate-x-[1px] border-r-0 py-1">
          <BlueprintInfo building={selectedBuilding} />
        </Card>
      )}
    </>
  );
};
