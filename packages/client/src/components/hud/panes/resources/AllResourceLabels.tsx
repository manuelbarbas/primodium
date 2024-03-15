import { EntityType } from "src/util/constants";
import { components } from "src/network/components";
import { ResourceLabel } from "./ResourceLabel";
import { StorageUtilityLabel } from "./UtilityLabel";

export const AllResourceLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="flex flex-col items-end p-4 bg-neutral border border-secondary">

      {/* Common Resources */}
      <div className="flex flex-col w-full">

        {/* Title & Unraidable Storage */}
        <div className="flex justify-between w-full align-bottom">
          <p className="text-xs opacity-75 font-bold">Common</p>
          <div>
            <StorageUtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} asteroid={activeRock} />
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-zinc-600 bg-opacity-20 p-2">
          <ResourceLabel name={"Iron"} resource={EntityType.Iron} />
          <ResourceLabel name={"Copper"} resource={EntityType.Copper} />
          <ResourceLabel name={"Lithium"} resource={EntityType.Lithium} />
          <ResourceLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
          <ResourceLabel name={"PV Cell"} resource={EntityType.PVCell} />
          <ResourceLabel name={"Alloy"} resource={EntityType.Alloy} />
        </div>
      </div>

      {/* Rare Resources */}
      <div className="flex flex-col pt-2 w-full">

        {/* Title & Unraidable Storage */}
        <div className="flex justify-between w-full align-bottom">
          <p className="text-xs opacity-75 font-bold">Rare</p>
          <div>
            <StorageUtilityLabel name={"Unraidable Motherlode Resources"} resourceId={EntityType.AdvancedUnraidable} asteroid={activeRock}/>
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-zinc-600 bg-opacity-20 p-2">
          <ResourceLabel name={"Titanium"} resource={EntityType.Titanium} />
          <ResourceLabel name={"Platinum"} resource={EntityType.Platinum} />
          <ResourceLabel name={"Iridium"} resource={EntityType.Iridium} />
          <ResourceLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
        </div>
      </div>

    </div>
  );
};
