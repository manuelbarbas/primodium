import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Navigator } from "src/components/core/Navigator";
import { Tabs } from "src/components/core/Tabs";
import { components } from "src/network/components";
import { CreateFleet } from "../../modals/fleets/CreateFleet";
import { FriendlyFleets } from "./FriendlyFleets";
import { HostileFleets } from "./HostileFleets";
import { ManageFleet } from "./ManageFleet";

export const Fleets = ({ initialScreen = "FleetsPane" }: { initialScreen?: string }) => {
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;
  const fleets = useEntityQuery([
    Has(components.IsFleet),
    HasValue(components.OwnedBy, { value: selectedRock as Entity }),
  ]);
  return (
    <Navigator initialScreen={initialScreen} className="w-full h-full border-0">
      <FleetsPane />
      <CreateFleet />
      {fleets.map((entity) => (
        <ManageFleet key={entity} fleetEntity={entity} />
      ))}
    </Navigator>
  );
};

const FleetsPane = () => (
  <Navigator.Screen title="FleetsPane" className="w-full h-full border-0">
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

      <Tabs.Pane index={1} className="rounded-r-none z-10 w-full h-full">
        <HostileFleets />
      </Tabs.Pane>
    </Tabs>
  </Navigator.Screen>
);
