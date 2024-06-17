import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { ExpandRange } from "../widgets/ExpandRange";
import { Upgrade } from "../widgets/Upgrade";
import { useCore } from "@primodiumxyz/core/react";

export const MainBase: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables } = useCore();
  const asteroid = tables.OwnedBy.use(building)?.value;
  return (
    <Navigator.Screen title={building} className="w-fit gap-1">
      <Upgrade building={building} />
      {asteroid && <ExpandRange asteroid={asteroid as Entity} />}
    </Navigator.Screen>
  );
};
