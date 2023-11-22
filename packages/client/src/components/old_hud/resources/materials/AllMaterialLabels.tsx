import { SecondaryCard } from "src/components/core/Card";
import { EntityType } from "src/util/constants";
import { MaterialLabel } from "./MaterialLabel";

export const AllMaterialLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <MaterialLabel name={"Iron"} resource={EntityType.Iron} />
      <MaterialLabel name={"Copper"} resource={EntityType.Copper} />
      <MaterialLabel name={"Lithium"} resource={EntityType.Lithium} />
      <MaterialLabel name={"Sulfur"} resource={EntityType.Sulfur} />
      <MaterialLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
      <MaterialLabel name={"Alloy"} resource={EntityType.Alloy} />
      <MaterialLabel name={"Photovoltaic Cell"} resource={EntityType.PVCell} />
      <MaterialLabel name={"Titanium"} resource={EntityType.Titanium} />
      <MaterialLabel name={"Platinum"} resource={EntityType.Platinum} />
      <MaterialLabel name={"Iridium"} resource={EntityType.Iridium} />
      <MaterialLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
    </SecondaryCard>
  );
};
