import { OrbitingFleets } from "./OrbitingFleets";
import { IncomingFleets } from "./IncomingFleets";
import { EntityID } from "@latticexyz/recs";
import { Tabs } from "src/components/core/Tabs";
import { Join } from "src/components/core/Join";

export const HostileFleets: React.FC<{
  spacerock: EntityID;
}> = ({ spacerock }) => {
  return (
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <Join>
        <Tabs.Button index={0} className="btn-sm">
          En Route
        </Tabs.Button>
        <Tabs.Button index={1} className="btn-sm">
          Orbiting
        </Tabs.Button>
      </Join>

      <Tabs.Pane index={0} className="w-full h-full p-0 border-none">
        <IncomingFleets spaceRock={spacerock} />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-full h-full p-0 border-none">
        <OrbitingFleets spaceRock={spacerock} />
      </Tabs.Pane>
    </Tabs>
  );
};
