import { Navigator } from "src/components/core/Navigator";
import { Tabs } from "src/components/core/Tabs";
import { CreateFleet } from "../../modals/fleets/CreateFleet";
import { FriendlyFleets } from "./FriendlyFleets";
import { HostileFleets } from "./HostileFleets";

export const Fleets = ({ initialScreen = "FleetsPane" }: { initialScreen?: string }) => {
  return (
    <Navigator initialScreen={initialScreen} className="w-full h-full border-0">
      <FleetsPane />
      <CreateFleet />
    </Navigator>
  );
};

const FleetsPane = () => (
  <Navigator.Screen title="FleetsPane" className="w-full h-full border-0">
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <div className="flex gap-1 w-full">
        <Tabs.Button index={0} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
          Friendly
        </Tabs.Button>
        <Tabs.Button index={1} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
          Hostile
        </Tabs.Button>
      </div>
      <Tabs.Pane index={0} className="rounded-r-none z-10 w-full h-full">
        <FriendlyFleets />
      </Tabs.Pane>

      <Tabs.Pane index={1} className="rounded-r-none z-10 w-full h-full">
        <HostileFleets />
      </Tabs.Pane>
    </Tabs>
  </Navigator.Screen>
);
