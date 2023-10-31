import { SecondaryCard } from "src/components/core/Card";
import { EntityType } from "src/util/constants";
import { DefenseLabel } from "./DefenseLabel";
import { UtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <UtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} />
      <UtilityLabel name={"Housing"} resourceId={EntityType.Housing} />
      <DefenseLabel />
    </SecondaryCard>
  );
};
