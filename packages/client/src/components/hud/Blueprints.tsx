import { Entity } from "@latticexyz/recs";
import { SecondaryCard } from "../core/Card";
import { BuildingImageFromType } from "../shared/BuildingImage";
import { Action, EntityType } from "src/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { Hex } from "viem";
import { Button } from "../core/Button";
import { getBlockTypeName } from "src/util/common";

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
      className={`relative btn-ghost w-fit p-0 hover:bg-accent disabled:opacity-25 rounded border border-secondary ${
        selectedBuilding === buildingType ? " ring-2 ring-warning" : ""
      }`}
    >
      <BuildingImageFromType buildingType={buildingType} />
    </Button>
  );
};

export const Blueprints = () => {
  return (
    <div className="flex h-fit w-full gap-1 items-start">
      <SecondaryCard className="gap-2 items-center">
        <p className="text-xs opacity-50 font-bold pb-2">SMALL</p>
        <Blueprint buildingType={EntityType.IronMine} />
        <Blueprint buildingType={EntityType.CopperMine} />
        <Blueprint buildingType={EntityType.LithiumMine} />
        <Blueprint buildingType={EntityType.SulfurMine} />
      </SecondaryCard>
      <SecondaryCard className="gap-2 items-center">
        <p className="text-xs opacity-50 font-bold pb-2">MEDIUM</p>
        <Blueprint tooltipDirection="top" buildingType={EntityType.Garage} />
        <Blueprint tooltipDirection="top" buildingType={EntityType.Workshop} />
        <Blueprint tooltipDirection="top" buildingType={EntityType.IronPlateFactory} />
        <Blueprint tooltipDirection="top" buildingType={EntityType.AlloyFactory} />
        <Blueprint tooltipDirection="top" buildingType={EntityType.StarmapperStation} />
      </SecondaryCard>
      <SecondaryCard className="gap-2 items-center">
        <p className="text-xs opacity-50 font-bold pb-2">LARGE</p>
        <Blueprint tooltipDirection="left" buildingType={EntityType.Hangar} />
        <Blueprint tooltipDirection="left" buildingType={EntityType.DroneFactory} />
        <Blueprint tooltipDirection="left" buildingType={EntityType.ShieldGenerator} />
        <Blueprint tooltipDirection="left" buildingType={EntityType.SAMLauncher} />
      </SecondaryCard>
    </div>
  );
};
