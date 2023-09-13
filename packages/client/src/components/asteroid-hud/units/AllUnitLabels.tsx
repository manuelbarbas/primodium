import { SecondaryCard } from "src/components/core/Card";
import { BlockType } from "src/util/constants";
import { UnitLabel } from "./UnitLabel";

export const AllUnitLabels = () => {
  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      <UnitLabel
        name={"Anvil Light Drone"}
        resourceId={BlockType.AnvilLightDrone}
      />
      <UnitLabel name={"Stinger Drone"} resourceId={BlockType.StingerDrone} />
      <UnitLabel name={"Aegis Drone"} resourceId={BlockType.AegisDrone} />
      <UnitLabel name={"Mining Vessel"} resourceId={BlockType.MiningVessel} />
    </SecondaryCard>
  );
};
