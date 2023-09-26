import { EntityID, Has, HasValue } from "@latticexyz/recs";
import {
  HasCompletedObjective,
  Level,
  P_BuildingCountRequirement,
  P_HasBuiltBuilding,
  P_IsObjective,
  P_RaidRequirement,
  P_RequiredResources,
  P_RequiredUtility,
  P_UnitRequirement,
} from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";

import { FaShieldAlt } from "react-icons/fa";
import { SingletonID } from "@latticexyz/network";
import { useGameStore } from "src/store/GameStore";
import { useMud } from "src/hooks/useMud";
import { useMemo, useState } from "react";

import {
  getCanClaimObjective,
  getIsObjectiveAvailable,
} from "src/util/objectives";
import { claimObjective } from "src/util/web3/claimObjective";
import { useEntityQuery } from "@latticexyz/react";
import { world } from "src/network/world";
import { hashAndTrimKeyEntity } from "src/util/encode";
import { getBlockTypeName } from "src/util/common";
import { getRewards } from "src/util/reward";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const ClaimObjectiveButton: React.FC<{
  objectiveEntity: EntityID;
}> = ({ objectiveEntity }) => {
  const network = useMud();

  const levelRequirement = Level.use(objectiveEntity);
  const objectiveClaimedRequirement =
    HasCompletedObjective.use(objectiveEntity);

  const hasBuiltBuildingRequirement = P_HasBuiltBuilding.use(objectiveEntity);
  const buildingCountRequirement =
    P_BuildingCountRequirement.use(objectiveEntity);
  const raidRequirement = P_RaidRequirement.use(objectiveEntity);

  const resourceRequirement = P_RequiredResources.use(objectiveEntity);
  const utilityRequirement = P_RequiredUtility.use(objectiveEntity);
  const unitRequirement = P_UnitRequirement.use(objectiveEntity);
  const player = Account.use()?.value ?? SingletonID;
  const hasCompletedObjective =
    HasCompletedObjective.use(hashAndTrimKeyEntity(objectiveEntity, player))
      ?.value ?? false;

  const canClaim = useMemo(() => {
    return getCanClaimObjective(objectiveEntity);
  }, [
    levelRequirement,
    objectiveClaimedRequirement,
    hasBuiltBuildingRequirement,
    buildingCountRequirement,
    raidRequirement,
    buildingCountRequirement,
    resourceRequirement,
    resourceRequirement,
    utilityRequirement,
    unitRequirement,
  ]);

  const transactionLoading = useGameStore((state) => state.transactionLoading);
  if (!hasCompletedObjective)
    return (
      <button
        disabled={!canClaim}
        className={`border p-1 rounded-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${"bg-cyan-700 border-cyan-500"} ${
          transactionLoading ? "opacity-50 pointer-events-none" : ""
        } `}
        onClick={() => {
          claimObjective(objectiveEntity, network);
        }}
      >
        {"Claim"}
      </button>
    );
  return null;
};

export const Objective: React.FC<{
  objective: EntityID;
}> = ({ objective }) => {
  if (!objective) return;
  const objectiveName = useMemo(() => {
    return getBlockTypeName(objective);
  }, [objective]);
  const rewardRecipee = useMemo(() => {
    return getRewards(objective);
  }, [objective]);
  return (
    <div className="flex items-center justify-between w-full border rounded-md border-slate-700 bg-slate-800 ">
      <div className="flex gap-1 items-center">
        {
          <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <FaShieldAlt size={16} />
            <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
              Objective
            </p>
          </div>
        }
        <LabeledValue label="Objective: ">
          <p>{objectiveName}</p>
        </LabeledValue>
      </div>
      <div className="text-right mr-2">
        <ClaimObjectiveButton objectiveEntity={objective} />
      </div>
    </div>
  );
};

export const UnclaimedObjective: React.FC<{ user: EntityID }> = () => {
  const objectives = useEntityQuery(
    [HasValue(P_IsObjective, { value: true })],
    {
      updateOnValueChange: true,
    }
  );

  console.log("objective count: ", objectives.length);
  const player = Account.use()?.value ?? SingletonID;

  return (
    <div className="grid gap-2 min-h-fit max-h-56 overflow-y-auto">
      {objectives.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">NO AVAILABLE OBJECTIVES</p>
        </div>
      ) : (
        objectives.map((objective, i) => {
          const isAvailable = getIsObjectiveAvailable(
            world.entities[objective]
          );
          const claimed =
            HasCompletedObjective.get(
              hashAndTrimKeyEntity(world.entities[objective], player)
            )?.value ?? false;
          if (!objective || !isAvailable || claimed) return null;
          return <Objective key={i} objective={world.entities[objective]} />;
        })
      )}
    </div>
  );
};

export const ClaimedObjective: React.FC<{ user: EntityID }> = () => {
  const objectives = useEntityQuery([Has(P_IsObjective)], {
    updateOnValueChange: true,
  });

  const player = Account.use()?.value ?? SingletonID;

  return (
    <div className="grid gap-2 min-h-fit max-h-56 overflow-y-auto">
      {objectives.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">NO COMPLETED OBJECTIVES</p>
        </div>
      ) : (
        objectives.map((objective, i) => {
          const claimed =
            HasCompletedObjective.get(
              hashAndTrimKeyEntity(world.entities[objective], player)
            )?.value ?? false;
          if (!objective || !claimed) return null;
          return <Objective key={i} objective={world.entities[objective]} />;
        })
      )}
    </div>
  );
};

export const Objectives: React.FC<{ user: EntityID }> = ({ user }) => {
  const [index, setIndex] = useState<number>(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex items-center justify-center gap-2">
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 0 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(0)}
        >
          Available
        </button>
        <button
          className={`border  p-1 rounded-md text-sm hover:scale-105 transition-all ${
            index === 1 ? "border-cyan-700 bg-slate-800" : "border-slate-700"
          }`}
          onClick={() => setIndex(1)}
        >
          Completed
        </button>
      </div>

      {index === 0 && <UnclaimedObjective user={user} />}
      {index === 1 && <ClaimedObjective user={user} />}
    </div>
  );
};
