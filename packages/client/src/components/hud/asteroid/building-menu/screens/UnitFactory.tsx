import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { BuildUnit } from "@/components/hud/asteroid/building-menu/widgets/BuildUnit";
import { Upgrade } from "@/components/hud/asteroid/building-menu/widgets/Upgrade";

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
