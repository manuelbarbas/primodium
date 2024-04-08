import { Account } from "src/network/components/clientComponents";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components as comps } from "src/network/components";

import { ObjectiveEntityLookup } from "src/util/constants";
import { Hex } from "viem";
import { Objective } from "./Objective";

export const ClaimedObjectives: React.FC = () => {
  const player = Account.use()?.value ?? singletonEntity;
  const asteroidEntity = comps.ActiveRock.use()?.value;

  const filteredObjectiveEntities = Object.values(ObjectiveEntityLookup).filter((objective) => {
    const claimed =
      comps.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ?? false;

    return claimed;
  });

  if (!asteroidEntity || player === singletonEntity) return <></>;
  return (
    <div className="grid grid-cols-2 gap-2 w-full h-full">
      {filteredObjectiveEntities.length === 0 ? (
        <SecondaryCard className="w-full h-full items-center justify-center text-xs col-span-2">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectiveEntities.map((objectiveEntity, i) => {
          return <Objective key={i} objectiveEntity={objectiveEntity} asteroidEntity={asteroidEntity} />;
        })
      )}
    </div>
  );
};
