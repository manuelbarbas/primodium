import { SecondaryCard } from "src/components/core/Card";
import { BlockType } from "src/util/constants";
import { UtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <UtilityLabel
        name={"Electricity"}
        resourceId={BlockType.ElectricityUtilityResource}
      />
      <UtilityLabel
        name={"Housing"}
        resourceId={BlockType.HousingUtilityResource}
      />
    </SecondaryCard>
  );
};
