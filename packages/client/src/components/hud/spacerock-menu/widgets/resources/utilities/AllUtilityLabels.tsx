import { SecondaryCard } from "src/components/core/Card";
import { EntityType } from "src/util/constants";
import { DefenseLabel } from "./DefenseLabel";
import { UtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  return (
    <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
      <UtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} />
      <UtilityLabel name={"Housing"} resourceId={EntityType.Housing} />
      <DefenseLabel />
      <UtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} />
      <UtilityLabel name={"Unraidable Motherlode Resources"} resourceId={EntityType.AdvancedUnraidable} />
    </SecondaryCard>
  );
};
