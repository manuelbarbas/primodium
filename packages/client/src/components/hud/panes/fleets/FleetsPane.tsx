import { Tabs } from "src/components/core/Tabs";
import { FriendlyFleets } from "./FriendlyFleets";

export const FleetsPane: React.FC = () => (
  <div className="w-full h-full border-0">
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <div className="flex gap-1 w-full">
        <Tabs.Button index={0} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
          Owned Fleets
        </Tabs.Button>
        <Tabs.Button index={1} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
          Orbiting Fleets
        </Tabs.Button>
      </div>
      <Tabs.Pane index={0} className="rounded-r-none z-10 w-full h-full">
        <FriendlyFleets />
      </Tabs.Pane>
      {/* 
      <Tabs.Pane index={1} className="rounded-r-none z-10 w-full h-full">
        <HostileFleets />
      </Tabs.Pane> */}
    </Tabs>
  </div>
);
