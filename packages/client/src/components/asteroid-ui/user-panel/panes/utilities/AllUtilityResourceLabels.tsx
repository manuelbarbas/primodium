import { EntityIndex } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import useResourceCount from "src/hooks/useResourceCount";
import { BlockType } from "src/util/constants";
import { UtilityResourceLabel } from "./UtilityResourceLabel";

export const AllUtilityResourceLabels = ({
  entityIndex,
}: {
  entityIndex?: EntityIndex;
}) => {
  const { components } = useMud();

  const UtilityCapacity = useResourceCount(
    components.MaxUtility,
    BlockType.ElectricityUtilityResource,
    entityIndex
  );

  if (!UtilityCapacity)
    return (
      <div className="flex justify-center items-center text-sm font-bold">
        NO UTILITIES
      </div>
    );
  return (
    <div className="grid gap-2 min-h-fit max-h-56  overflow-y-auto">
      <UtilityResourceLabel
        name={"Electricity"}
        entityIndex={entityIndex}
        resourceId={BlockType.ElectricityUtilityResource}
      />
    </div>
  );
};
