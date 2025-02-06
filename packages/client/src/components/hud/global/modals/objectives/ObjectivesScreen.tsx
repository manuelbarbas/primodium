import { Hex } from "viem";

import { ObjectiveEntityLookup } from "@primodiumxyz/core";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Join } from "@/components/core/Join";
import { Tabs } from "@/components/core/Tabs";

import { ClaimedObjectives } from "./ClaimedObjectives";
import { UnclaimedObjectives } from "./UnclaimedObjectives";

export const ObjectivesScreen: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useAccountClient();
  const { tables } = useCore();

  const completedEntities = Object.values(ObjectiveEntityLookup).filter((objective) => {
    const claimed =
      tables.CompletedObjective.getWithKeys({ entity: playerEntity as Hex, objective: objective as Hex })?.value ??
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
