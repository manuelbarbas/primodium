import { useMud } from "src/hooks";
import { components } from "src/network/components";

import { Entity } from "@latticexyz/recs";
import { Tabs } from "src/components/core/Tabs";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { GracePeriod } from "../GracePeriod";
import { TargetHeader } from "./TargetHeader";
import { Resources } from "./widgets/resources/Resources";

export const SpacerockMenu: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;
  const selectedSpacerock = components.SelectedRock.use()?.value;
  const ownedBy = components.OwnedBy.use(selectedSpacerock)?.value ?? playerEntity;
  if (!selectedSpacerock) return null;
  return (
    <div className="w-screen px-2 flex justify-center">
      <Tabs className="min-w-fit w-[50rem] flex flex-col items-center gap-0">
        <Tabs.Button
          index={0}
          togglable
          onClick={() => {
            components.SelectedBuilding.remove();
            components.SelectedAction.remove();
          }}
          className="rounded-b-none border-b-0 btn-md border-secondary relative py-2 hover:text-accent group w-fit"
        >
          <TargetHeader />
        </Tabs.Button>
        <Tabs.Pane index={0} className="w-full border-b-0 rounded-x-none rounded-b-none relative">
          <Resources />
          <AccountDisplay
            player={ownedBy as Entity}
            showSpectate
            className="absolute right-6 -top-1 border border-secondary text-xs bg-base-100 !p-2 rounded-box rounded-t-none"
          />
          <GracePeriod
            player={ownedBy as Entity}
            className="absolute left-6 -top-1 border border-secondary text-xs p-2 bg-base-100 rounded-box rounded-t-none"
          />
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
