import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { DefenseLabel } from "./DefenseLabel";
import { UtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <SecondaryCard className="p-1 flex flex-col gap-1">
      <div className="flex w-full">
        <p className="text-xs opacity-75 font-bold text-accent uppercase">utilities</p>
      </div>
      <div className="grid grid-cols-2 w-full gap-1">
        <UtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />
        <UtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />
        <UtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} asteroid={activeRock} />
        <UtilityLabel
          name={"Unraidable Motherlode Resources"}
          resourceId={EntityType.AdvancedUnraidable}
          asteroid={activeRock}
        />
        <DefenseLabel />
      </div>
    </SecondaryCard>
  );
};
