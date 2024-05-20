import { Entity } from "@latticexyz/recs";
import { Navigator } from "@/components/core/Navigator";
import { Card, GlassCard } from "@/components/core/Card";
import { InitialScreen } from "@/components/hud/command/battle-menu/screens/InitialScreen";
import { memo } from "react";
import { AttackScreen } from "@/components/hud/command/battle-menu/screens/AttackScreen";

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
