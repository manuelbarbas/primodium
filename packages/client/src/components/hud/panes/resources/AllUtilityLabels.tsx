import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { StrengthLabel } from "./StrengthLabel";
import { UtilityLabel } from "./UtilityLabel";
import { CapacityBar } from "./CapacityBar";

export const AllUtilityLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="card bg-neutral border border-secondary p-2 bg-opacity-90 p-2 flex flex-col gap-0 border-t-transparent">

      <div className="grid grid-cols-2 w-full gap-1 py-2">
        <UtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />
        
        <UtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />
        <CapacityBar current={2100} max={2300} />

        {/* <UtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} asteroid={activeRock} />
        <UtilityLabel
          name={"Unraidable Motherlode Resources"}
          resourceId={EntityType.AdvancedUnraidable}
          asteroid={activeRock}
        /> */}
        {/* <StrengthLabel />
        <UtilityLabel name={"Encryption"} resourceId={EntityType.Encryption} asteroid={activeRock} showCount /> */}
      </div>
    </div>
  );
};
