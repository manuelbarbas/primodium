import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { BarLayoutUtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="grid grid-cols-2 w-72 gap-1.5 p-2 pt-4">
      <BarLayoutUtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />

      <BarLayoutUtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />
    </div>
  );
};
