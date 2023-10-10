import { SecondaryCard } from "src/components/core/Card";
import { EntityType } from "src/util/constants";
import { MaterialLabel } from "./MaterialLabel";

export const AllMaterialLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <MaterialLabel name={"Iron"} resourceId={EntityType.Iron} />
      <MaterialLabel name={"Copper"} resourceId={EntityType.Copper} />
      <MaterialLabel name={"Lithium"} resourceId={EntityType.Lithium} />
      <MaterialLabel name={"Sulfur"} resourceId={EntityType.Sulfur} />
      <MaterialLabel name={"Iron Plate"} resourceId={EntityType.IronPlate} />
      <MaterialLabel name={"Alloy"} resourceId={EntityType.Alloy} />
      <MaterialLabel name={"Photovoltaic Cell"} resourceId={EntityType.PhotovoltaicCell} />
      <MaterialLabel name={"Titanium"} resourceId={EntityType.Titanium} />
      <MaterialLabel name={"Platinum"} resourceId={EntityType.Platinum} />
      <MaterialLabel name={"Iridium"} resourceId={EntityType.Iridium} />
      <MaterialLabel name={"Kimberlite"} resourceId={EntityType.Kimberlite} />
      <MaterialLabel name={"Bolutite"} resourceId={EntityType.Bolutite} />
      <MaterialLabel name={"Osmium"} resourceId={EntityType.Osmium} />
      <MaterialLabel name={"Tungsten"} resourceId={EntityType.Tungsten} />
      <MaterialLabel name={"Uraninite"} resourceId={EntityType.Uraninite} />
      <MaterialLabel name={"Bullet"} resourceId={EntityType.BulletCrafted} />
    </SecondaryCard>
  );
};
