import { Entity } from "@latticexyz/recs";
import { SecondaryCard } from "../core/Card";
import { BuildingImageFromType } from "../shared/BuildingImage";
import { Action, EntityType } from "src/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { Button } from "../core/Button";
import { getBlockTypeName } from "src/util/common";
import { FaLock } from "react-icons/fa";

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
      className={`relative btn-ghost w-fit p-0 hover:bg-accent disabled:opacity-50 border border-secondary hover:z-10 ${
        selectedBuilding === buildingType ? " ring-2 ring-warning" : ""
      }`}
    >
      <BuildingImageFromType buildingType={buildingType} />
      {mainbaseLevel < levelRequirement && (
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
  return (
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
  );
};
