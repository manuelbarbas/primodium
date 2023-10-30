import { SecondaryCard } from "src/components/core/Card";
import { EntityType } from "src/util/constants";
import { MultiplierLabel } from "./MultiplierLabel";

export const AllMultiplierLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <MultiplierLabel name={"Defense Multiplier"} resource={EntityType.DefenseMultiplier} />
    </SecondaryCard>
  );
};
