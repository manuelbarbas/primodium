import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { ExpandRange } from "../widgets/ExpandRange";
import { Upgrade } from "../widgets/Upgrade";

export const MainBase: React.FC<{ building: Entity }> = ({ building }) => {
  const asteroid = components.OwnedBy.use(building)?.value;
  return (
    <Navigator.Screen title={building} className="w-fit gap-1">
      <Upgrade building={building} />
      {asteroid && <ExpandRange asteroid={asteroid as Entity} />}
    </Navigator.Screen>
  );
};
