import { EntityType } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";

import { BarLayoutUtilityLabel } from "./UtilityLabel";

export const AllUtilityLabels = () => {
  const { tables } = useCore();
  const activeRock = tables.ActiveRock.use()?.value;
  if (!activeRock) return null;
  return (
    <div className="flex flex-col w-full gap-1.5 p-2 pt-4">
      <BarLayoutUtilityLabel name={"Electricity"} resourceId={EntityType.Electricity} asteroid={activeRock} />

      <BarLayoutUtilityLabel name={"Housing"} resourceId={EntityType.Housing} asteroid={activeRock} />
    </div>
  );
};
