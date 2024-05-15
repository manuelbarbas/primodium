import { Entity } from "@latticexyz/recs";
import { Navigator } from "@/components/core/Navigator";
import { Card } from "@/components/core/Card";
import { InitialScreen } from "@/components/hud/starbelt/asteroid-menu/screens/InitialScreen";
import { FleetTravelScreen } from "@/components/hud/starbelt/asteroid-menu/screens/FleetTravelScreen";
import { memo } from "react";

export const AsteroidMenu: React.FC<{ selectedRock: Entity }> = memo(({ selectedRock }) => {
  return (
    <Navigator initialScreen="initial" className="border-none p-0 relative overflow-visible flex flex-col gap-2">
      <Card noDecor>
        <InitialScreen selectedRock={selectedRock} />
        <FleetTravelScreen selectedRock={selectedRock} />
      </Card>
    </Navigator>
  );
});
