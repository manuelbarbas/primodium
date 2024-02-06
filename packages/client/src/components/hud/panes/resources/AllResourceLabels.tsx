import { EntityType } from "src/util/constants";
import { ResourceLabel } from "./ResourceLabel";

export const AllResourceLabels = () => {
  return (
    <div className="flex flex-col items-end p-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-success">BASIC</p>
          <div className="flex gap-1 items-center text-xs text-warning">*</div>
        </div>

        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Iron"} resource={EntityType.Iron} />
          <ResourceLabel name={"Copper"} resource={EntityType.Copper} />
          <ResourceLabel name={"Lithium"} resource={EntityType.Lithium} />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 w-full text-info">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-info">ADVANCED</p>
          <div className="flex gap-1 items-center text-xs text-warning">**</div>
        </div>
        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
          <ResourceLabel name={"PV Cell"} resource={EntityType.PVCell} />
          <ResourceLabel name={"Alloy"} resource={EntityType.Alloy} />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 w-full">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-warning">ELITE</p>
          <div className="flex gap-1 items-center text-xs text-warning">***</div>
        </div>
        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Titanium"} resource={EntityType.Titanium} />
          <ResourceLabel name={"Platinum"} resource={EntityType.Platinum} />
          <ResourceLabel name={"Iridium"} resource={EntityType.Iridium} />
          <ResourceLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
        </div>
      </div>
    </div>
  );
};
