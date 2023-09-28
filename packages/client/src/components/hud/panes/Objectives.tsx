import { EntityID, Has, HasValue, Not } from "@latticexyz/recs";
import {
  HasCompletedObjective,
  IsDebug,
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

import { SingletonID } from "@latticexyz/network";
import { useGameStore } from "src/store/GameStore";
import { useMud } from "src/hooks/useMud";
import { useMemo } from "react";

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
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { SecondaryCard } from "src/components/core/Card";
import { Button } from "src/components/core/Button";
import { Badge } from "src/components/core/Badge";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import {
  BackgroundImage,
  RESOURCE_SCALE,
  ResourceImage,
  ResourceType,
  getBlockTypeDescription,
} from "src/util/constants";
import { FaCheck, FaGift, FaMedal } from "react-icons/fa";

const ClaimObjectiveButton: React.FC<{
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
      <Button
        disabled={!canClaim}
        className={`btn-sm btn-secondary border-accent w-full col-span-2`}
        loading={transactionLoading}
        onClick={() => {
          claimObjective(objectiveEntity, network);
        }}
      >
        {"Claim"}
      </Button>
    );

  return (
    <div className="col-span-2 flex items-center justify-end">
      <FaCheck className=" text-success mr-2" />
    </div>
  );
};

const Objective: React.FC<{
  objective: EntityID;
}> = ({ objective }) => {
  const objectiveName = useMemo(() => {
    if (!objective) return;
    return getBlockTypeDescription(objective);
  }, [objective]);
  const rewardRecipe = useMemo(() => {
    if (!objective) return;
    return getRewards(objective);
  }, [objective]);

  return (
    <SecondaryCard className="text-xs w-full">
      <div className="grid grid-cols-10">
        <div className="flex items-center col-span-1">
          <FaMedal className="text-accent" />
        </div>
        <p className=" col-span-7 font-bold flex items-center px-1">
          {objectiveName}
        </p>

        <ClaimObjectiveButton objectiveEntity={objective} />
      </div>

      {rewardRecipe && rewardRecipe.length !== 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <hr className="border-t border-accent/20 w-full mb-1 mt-3" />
          <span className="flex gap-1 items-center opacity-75">
            <FaGift /> REWARDS:
          </span>

          {rewardRecipe.map((resource) => {
            return (
              <Badge key={resource.id} className="text-xs gap-2 badge-neutral">
                <ResourceIconTooltip
                  name={getBlockTypeName(resource.id)}
                  image={
                    ResourceImage.get(resource.id) ??
                    BackgroundImage.get(resource.id)?.at(0) ??
                    ""
                  }
                  resourceId={resource.id}
                  amount={resource.amount}
                  resourceType={resource.type}
                  scale={
                    resource.type === ResourceType.Utility ? 1 : RESOURCE_SCALE
                  }
                  direction="top"
                />
              </Badge>
            );
          })}
        </div>
      )}
    </SecondaryCard>
  );
};

const UnclaimedObjective: React.FC = () => {
  const objectives = useEntityQuery([
    HasValue(P_IsObjective, { value: true }),
    Not(IsDebug),
  ]);
  const player = Account.use()?.value ?? SingletonID;

  const filteredObjectives = useMemo(() => {
    return objectives.filter((objective) => {
      const isAvailable = getIsObjectiveAvailable(world.entities[objective]);

      const claimed =
        HasCompletedObjective.get(
          hashAndTrimKeyEntity(world.entities[objective], player)
        )?.value ?? false;

      return isAvailable && !claimed;
    });
  }, [objectives]);

  return (
    <div className="w-full h-full">
      {filteredObjectives.length === 0 ? (
        <SecondaryCard className="w-full h-full items-center justify-center text-xs">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectives.map((objective, i) => {
          return <Objective key={i} objective={world.entities[objective]} />;
        })
      )}
    </div>
  );
};

const ClaimedObjective: React.FC = () => {
  const objectives = useEntityQuery([Has(P_IsObjective)], {
    updateOnValueChange: true,
  });

  const player = Account.use()?.value ?? SingletonID;

  const filteredObjectives = useMemo(() => {
    return objectives.filter((objective) => {
      const claimed =
        HasCompletedObjective.get(
          hashAndTrimKeyEntity(world.entities[objective], player)
        )?.value ?? false;

      return claimed;
    });
  }, [objectives]);

  return (
    <div className="w-full h-full">
      {filteredObjectives.length === 0 ? (
        <SecondaryCard className="w-full h-full items-center justify-center text-xs">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectives.map((objective, i) => {
          return <Objective key={i} objective={world.entities[objective]} />;
        })
      )}
    </div>
  );
};

export const Objectives: React.FC = () => {
  return (
    <Tabs className="w-full flex flex-col items-center h-full">
      <Join className="border-secondary">
        <Tabs.Button index={0} className="btn-sm">
          Available
        </Tabs.Button>
        <Tabs.Button index={1} className="btn-sm">
          Completed
        </Tabs.Button>
      </Join>

      <Tabs.Pane className="border-none w-full h-full p-0" index={0}>
        <UnclaimedObjective />
      </Tabs.Pane>
      <Tabs.Pane className="border-none w-full h-full" index={1}>
        <ClaimedObjective />
      </Tabs.Pane>
    </Tabs>
  );
};
