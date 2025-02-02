import { memo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { Card, GlassCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { AttackScreen } from "@/components/hud/command/battle-menu/screens/AttackScreen";
import { InitialScreen } from "@/components/hud/command/battle-menu/screens/InitialScreen";

export const BattleMenu: React.FC<{ target: Entity; selectedRock: Entity }> = memo(({ target, selectedRock }) => {
  return (
    <GlassCard direction={"bottom"} className="">
      <Navigator
        initialScreen="initial"
        className="border-none p-0 relative overflow-visible flex flex-col gap-2 h-full"
      >
        <Card noDecor className="w-full h-full">
          <InitialScreen target={target} />
          <AttackScreen selectedRock={selectedRock} target={target} />
        </Card>
      </Navigator>
    </GlassCard>
  );
});
