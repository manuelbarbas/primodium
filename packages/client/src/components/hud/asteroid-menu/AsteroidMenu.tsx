import { Entity } from "@latticexyz/recs";
import { Navigator } from "@/components/core/Navigator";
import { Card } from "@/components/core/Card";
import { InitialScreen } from "@/components/hud/asteroid-menu/screens/InitialScreen";
import { FleetTravelScreen } from "@/components/hud/asteroid-menu/screens/FleetTravelScreen";

export const AsteroidMenu: React.FC<{ selectedRock: Entity }> = ({ selectedRock }) => {
  return (
    <Card noDecor>
      <Navigator initialScreen="initial" className="border-none p-0 relative overflow-visible flex flex-col gap-2">
        <InitialScreen selectedRock={selectedRock} />
        <FleetTravelScreen selectedRock={selectedRock} />
      </Navigator>
    </Card>
  );
};
