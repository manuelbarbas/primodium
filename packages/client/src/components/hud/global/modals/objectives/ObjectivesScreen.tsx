import { Entity } from "@primodiumxyz/reactive-tables";

import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { ObjectiveEntityLookup } from "src/util/constants";
import { Hex } from "viem";
import { ClaimedObjectives } from "./ClaimedObjectives";
import { UnclaimedObjectives } from "./UnclaimedObjectives";

export const ObjectivesScreen: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const completedEntities = Object.values(ObjectiveEntityLookup).filter((objective) => {
    const claimed =
      components.CompletedObjective.getWithKeys({ entity: playerEntity as Hex, objective: objective as Hex })?.value ??
      false;

    return claimed;
  }).length;
  const totalEntities = Object.values(ObjectiveEntityLookup).length;

  return (
    <Tabs className="flex flex-col relative gap-2 items-center w-full h-full">
      <Join className="border-secondary border border-secondary/25">
        <Tabs.Button index={0} className="btn-sm">
          Available
        </Tabs.Button>
        <Tabs.Button index={1} className="btn-sm">
          Completed
        </Tabs.Button>
      </Join>
      <p className="absolute top-2 right-2 font-bold uppercase text-sm text-xs opacity-60">
        {completedEntities} / {totalEntities} completed
      </p>

      <Tabs.Pane className="border-none w-full h-full" index={0}>
        <UnclaimedObjectives highlight={highlight} />
      </Tabs.Pane>
      <Tabs.Pane className="border-none w-full h-full" index={1}>
        <ClaimedObjectives />
      </Tabs.Pane>
    </Tabs>
  );
};
