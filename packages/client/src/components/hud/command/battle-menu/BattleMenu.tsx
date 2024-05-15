import { Entity } from "@latticexyz/recs";
import { Navigator } from "@/components/core/Navigator";
import { Card, GlassCard } from "@/components/core/Card";
import { InitialScreen } from "@/components/hud/command/battle-menu/screens/InitialScreen";
// import { InitialScreen } from "@/components/hud/starbelt/asteroid-menu/screens/InitialScreen";
// import { FleetTravelScreen } from "@/components/hud/starbelt/asteroid-menu/screens/FleetTravelScreen";
import { memo } from "react";

export const BattleMenu: React.FC<{ target: Entity }> = memo(({ target }) => {
  return (
    <GlassCard direction={"bottom"} className="w-96">
      <Navigator
        initialScreen="initial"
        className="border-none p-0 relative overflow-visible flex flex-col gap-2 h-full"
      >
        <Card noDecor className="w-full h-full">
          <InitialScreen target={target} />
          {/* <FleetTravelScreen selectedRock={selectedRock} /> */}
        </Card>
      </Navigator>
    </GlassCard>
  );
});
