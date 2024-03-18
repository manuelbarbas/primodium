import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { BarLayoutUtilityLabel} from "./UtilityLabel";

export const AllUtilityLabels = () => {
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="card bg-neutral border border-secondary p-2 bg-opacity-90 p-2 flex flex-col gap-0 border-t-transparent w-72">

      <div className="grid grid-cols-2 w-full gap-1.5 p-2">
        <BarLayoutUtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />
        
        <BarLayoutUtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />

      </div>
    </div>
  );
};
