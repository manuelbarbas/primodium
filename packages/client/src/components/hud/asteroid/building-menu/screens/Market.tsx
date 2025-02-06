import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { OpenMarket } from "@/components/hud/asteroid/building-menu/widgets/OpenMarket";
import { Upgrade } from "@/components/hud/asteroid/building-menu/widgets/Upgrade";

export const Market: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full gap-1">
      <Upgrade building={building} />
      <OpenMarket building={building} />
    </Navigator.Screen>
  );
};
