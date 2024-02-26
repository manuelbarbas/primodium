import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { DefenseLabel } from "./DefenseLabel";
import { UtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
      <UtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />
      <UtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />
      <DefenseLabel />
      <UtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} asteroid={activeRock} />
      <UtilityLabel
        name={"Unraidable Motherlode Resources"}
        resourceId={EntityType.AdvancedUnraidable}
        asteroid={activeRock}
      />
    </SecondaryCard>
  );
};
