import { Entity } from "@latticexyz/recs";

import { Account, Time } from "src/network/components/clientComponents";

import { useMemo } from "react";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components as comps } from "src/network/components";

import { ObjectiveEntityLookup } from "src/util/constants";
import { canShowObjective } from "src/util/objectives/objectiveRequirements";
import { Hex } from "viem";
import { Objective } from "./Objective";

export const UnclaimedObjectives: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  const player = Account.use()?.value ?? singletonEntity;
  const asteroidEntity = comps.ActiveRock.use()?.value;
  const time = Time.use()?.value;
  const objectives = Object.values(ObjectiveEntityLookup);

  const filteredObjectiveEntities = useMemo(() => {
    return objectives.filter((objective) => {
      const canShow = canShowObjective(player, objective);

      const claimed =
        comps.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ?? false;

      return canShow && !claimed;
    });
  }, [time]);

  if (!asteroidEntity || player === singletonEntity) return <></>;

  return (
    <div className="grid grid-cols-2 gap-2 w-full h-full">
      {filteredObjectiveEntities.length === 0 ? (
        <SecondaryCard className="w-full h-full col-span-2 items-center justify-center text-xs">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectiveEntities.map((objectiveEntity, i) => {
          return (
            <Objective
              key={i}
              objectiveEntity={objectiveEntity}
              highlight={objectiveEntity === highlight}
              asteroidEntity={asteroidEntity}
            />
          );
        })
      )}
    </div>
  );
};
