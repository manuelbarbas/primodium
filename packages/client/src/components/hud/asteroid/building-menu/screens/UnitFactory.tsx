import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { BuildUnit } from "../widgets/BuildUnit";
import { Upgrade } from "../widgets/Upgrade";

export const UnitFactory: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full gap-1">
      <Upgrade building={building} />
      <div className="w-full gap-1">
        <BuildUnit />
      </div>
    </Navigator.Screen>
  );
};
