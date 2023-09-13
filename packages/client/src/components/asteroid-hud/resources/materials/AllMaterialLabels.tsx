import { SecondaryCard } from "src/components/core/Card";
import { BlockType } from "src/util/constants";
import { MaterialLabel } from "./MaterialLabel";

export const AllMaterialLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <MaterialLabel name={"Iron"} resourceId={BlockType.Iron} />
      <MaterialLabel name={"Copper"} resourceId={BlockType.Copper} />
      <MaterialLabel name={"Lithium"} resourceId={BlockType.Lithium} />
      <MaterialLabel name={"Sulfur"} resourceId={BlockType.Sulfur} />
      <MaterialLabel
        name={"Iron Plate"}
        resourceId={BlockType.IronPlateCrafted}
      />
      <MaterialLabel name={"Alloy"} resourceId={BlockType.Alloy} />
      <MaterialLabel
        name={"Photovoltaic Cell"}
        resourceId={BlockType.PhotovoltaicCell}
      />
      <MaterialLabel name={"Titanium"} resourceId={BlockType.Titanium} />
      <MaterialLabel name={"Platinum"} resourceId={BlockType.Platinum} />
      <MaterialLabel name={"Iridium"} resourceId={BlockType.Iridium} />
      <MaterialLabel name={"Kimberlite"} resourceId={BlockType.Kimberlite} />
      <MaterialLabel name={"Bolutite"} resourceId={BlockType.Bolutite} />
      <MaterialLabel name={"Osmium"} resourceId={BlockType.Osmium} />
      <MaterialLabel name={"Tungsten"} resourceId={BlockType.Tungsten} />
      <MaterialLabel name={"Uraninite"} resourceId={BlockType.Uraninite} />
      <MaterialLabel name={"Bullet"} resourceId={BlockType.BulletCrafted} />
    </SecondaryCard>
  );
};
