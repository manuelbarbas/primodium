import { EntityType } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { SecondaryCard } from "@/components/core/Card";

import { ResourceLabel } from "./ResourceLabel";
import { VaultUtilityLabel } from "./UtilityLabel";

export const AllResourceLabels = () => {
  const { tables } = useCore();
  const activeRock = tables.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="flex flex-col items-end p-2 border-b border-secondary/25 w-full">
      {/* Common Resources */}
      <div className="flex flex-col w-full">
        {/* Title & Unraidable Storage */}
        <div className="flex justify-between w-full align-bottom">
          <p className="text-xs opacity-75 font-bold">Common</p>
          <div>
            <VaultUtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} asteroid={activeRock} />
          </div>
        </div>

        <SecondaryCard className="flex flex-col gap-1 p-2 mt-1">
          <ResourceLabel name={"Iron"} resource={EntityType.Iron} />
          <ResourceLabel name={"Copper"} resource={EntityType.Copper} />
          <ResourceLabel name={"Lithium"} resource={EntityType.Lithium} />
          <ResourceLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
          <ResourceLabel name={"PV Cell"} resource={EntityType.PVCell} />
          <ResourceLabel name={"Alloy"} resource={EntityType.Alloy} />
        </SecondaryCard>
      </div>

      {/* Rare Resources */}
      <div className="flex flex-col pt-2 w-full">
        {/* Title & Unraidable Storage */}
        <div className="flex justify-between w-full align-bottom">
          <p className="text-xs opacity-75 font-bold">Rare</p>
          <div>
            <VaultUtilityLabel
              name={"Unraidable Motherlode Resources"}
              resourceId={EntityType.AdvancedUnraidable}
              asteroid={activeRock}
            />
          </div>
        </div>

        <SecondaryCard className="flex flex-col gap-1 p-2 mt-1">
          <ResourceLabel name={"Titanium"} resource={EntityType.Titanium} />
          <ResourceLabel name={"Platinum"} resource={EntityType.Platinum} />
          <ResourceLabel name={"Iridium"} resource={EntityType.Iridium} />
          <ResourceLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
        </SecondaryCard>
      </div>
    </div>
  );
};
