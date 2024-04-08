import { Entity } from "@latticexyz/recs";

import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { ClaimedObjectives } from "./ClaimedObjectives";
import { UnclaimedObjectives } from "./UnclaimedObjectives";

export const ObjectivesScreen: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  return (
    <Tabs className="flex flex-col items-center w-full h-full">
      <Join className="border-secondary border border-secondary/25">
        <Tabs.Button showActive index={0} className="btn-sm">
          Available
        </Tabs.Button>
        <Tabs.Button showActive index={1} className="btn-sm">
          Completed
        </Tabs.Button>
      </Join>

      <Tabs.Pane className="border-none w-full h-full" index={0}>
        <UnclaimedObjectives highlight={highlight} />
      </Tabs.Pane>
      <Tabs.Pane className="border-none w-full" index={1}>
        <ClaimedObjectives />
      </Tabs.Pane>
    </Tabs>
  );
};
