import { memo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { Card } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { FleetTravelScreen } from "@/components/hud/starbelt/asteroid-menu/screens/FleetTravelScreen";
import { InitialScreen } from "@/components/hud/starbelt/asteroid-menu/screens/InitialScreen";

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
