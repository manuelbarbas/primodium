import { Entity } from "@latticexyz/recs";

import { Account, Time } from "src/network/components/clientComponents";

import { useMemo } from "react";
import { useMud } from "src/hooks/useMud";

import { AudioKeys } from "@game/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaCheck, FaGift, FaMedal, FaSpinner } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { components as comps } from "src/network/components";
import { formatNumber, getBlockTypeName } from "src/util/common";
import {
  BackgroundImage,
  ObjectiveEntityLookup,
  RequirementType,
  ResourceImage,
  ResourceType,
  TransactionQueueType,
} from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getObjectiveDescription } from "src/util/objectiveDescriptions";
import {
  getAllRequirements,
  getCanClaimObjective,
  getIsObjectiveAvailable,
  isAllRequirementsMet,
} from "src/util/objectives";
import { getFullResourceCount } from "src/util/resource";
import { getRewards } from "src/util/reward";
import { claimObjective } from "src/util/web3/contractCalls/claimObjective";
import { Hex } from "viem";

const ClaimObjectiveButton: React.FC<{
  objectiveEntity: Entity;
}> = ({ objectiveEntity }) => {
  const network = useMud();
  const time = Time.use()?.value;
  const levelRequirement = comps.Level.use(objectiveEntity);
  const objectiveClaimedRequirement = comps.CompletedObjective.use(objectiveEntity);

  const hasBuiltBuildingRequirement = comps.P_HasBuiltBuildings.use(objectiveEntity);
  const raidRequirement = comps.P_RaidedResources.use(objectiveEntity);

  const resourceRequirement = comps.P_RequiredResources.use(objectiveEntity);
  const unitRequirement = comps.P_ProducedUnits.use(objectiveEntity);
  const player = Account.use()?.value ?? singletonEntity;
  const hasCompletedObjective =
    comps.CompletedObjective.useWithKeys({ objective: objectiveEntity as Hex, entity: player as Hex })?.value ?? false;

  const canClaim = useMemo(() => {
    return getCanClaimObjective(objectiveEntity, player);
  }, [
    levelRequirement,
    objectiveClaimedRequirement,
    hasBuiltBuildingRequirement,
    raidRequirement,
    resourceRequirement,
    resourceRequirement,
    unitRequirement,
    time,
    objectiveEntity,
  ]);

  if (!hasCompletedObjective)
    return (
      <TransactionQueueMask
        className="w-full mt-2"
        queueItemId={hashEntities(TransactionQueueType.ClaimObjective, objectiveEntity)}
      >
        <Button
          disabled={!canClaim}
          className={`btn-sm btn-secondary border-accent w-full`}
          clickSound={AudioKeys.Complete2}
          onClick={() => {
            claimObjective(objectiveEntity, network.network);
          }}
        >
          {"Claim"}
        </Button>
      </TransactionQueueMask>
    );

  return (
    <div className="flex items-center justify-end">
      <FaCheck className=" text-success mr-2" />
    </div>
  );
};

const Objective: React.FC<{
  objective: Entity;
  highlight?: boolean;
}> = ({ objective, highlight = false }) => {
  const time = Time.use()?.value;
  const playerEntity = Account.use()?.value;
  const spaceRock = comps.Home.use(playerEntity)?.asteroid as Entity | undefined;
  const objectiveName = useMemo(() => {
    if (!objective) return;
    return getBlockTypeName(objective);
  }, [objective]);
  const objectiveDescription = useMemo(() => {
    if (!objective) return;
    return getObjectiveDescription(objective);
  }, [objective]);
  const rewardRecipe = useMemo(() => {
    if (!objective) return;
    return getRewards(objective);
  }, [objective]);

  const requirements = useMemo(() => {
    if (!objective || !playerEntity) return;
    const reqs = getAllRequirements(objective, playerEntity);
    return reqs;
  }, [objective, time, playerEntity]);

  if (!spaceRock || playerEntity === singletonEntity) return <></>;

  return (
    <SecondaryCard className={`text-xs w-full flex flex-col justify-between ${highlight ? "ring ring-warning" : ""}`}>
      <div>
        <div className="grid grid-cols-10">
          <div className="flex items-center col-span-1">
            <FaMedal className="text-accent" />
          </div>
          <p className=" col-span-7 font-bold flex items-center px-1">{objectiveName}</p>
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          <hr className="border-t border-accent/20 w-full mb-1 mt-3" />
          <p className=" col-span-7 flex items-center px-1 opacity-75 font-normal">{objectiveDescription}</p>
          <hr className="border-t border-accent/20 w-full mb-1 mt-3" />
          <div className="col-span-10 w-full flex flex-wrap gap-1">
            <span className="flex gap-1 items-center opacity-75">
              <FaSpinner /> PROGRESS:
            </span>
            {Object.entries(requirements ?? {}).map(([, req], index) => {
              const complete = isAllRequirementsMet(req);
              return (
                <div key={index} className="flex flex-wrap gap-1">
                  {req.map((_req, index) => {
                    const value = _req.currentValue > _req.requiredValue ? _req.requiredValue : _req.currentValue;

                    return (
                      <Badge key={index} className={`text-xs gap-2 ${complete ? "badge-success" : "badge-neutral"}`}>
                        <IconLabel
                          imageUri={
                            ResourceImage.get(_req.id) ??
                            BackgroundImage.get(_req.id)?.at(0) ??
                            "/img/icons/minersicon.png"
                          }
                          text={formatNumber(value / _req.scale, { short: true, fractionDigits: 3 })}
                          tooltipDirection={"bottom"}
                          tooltipText={
                            _req.type === RequirementType.DefeatedPirates
                              ? "Defeated Pirates"
                              : getBlockTypeName(_req.id)
                          }
                          className="text-xs font-bold"
                        />

                        <span className="font-bold">
                          / {formatNumber(_req.requiredValue / _req.scale, { short: true, fractionDigits: 1 })}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {rewardRecipe && rewardRecipe.length !== 0 && (
            <div className="col-span-10 w-full flex flex-wrap gap-1">
              <span className="flex gap-1 items-center opacity-75">
                <FaGift /> REWARDS:
              </span>

              {rewardRecipe.map((resource) => {
                let canClaim = true;
                if (resource.type === ResourceType.Resource) {
                  const { resourceCount, resourceStorage: maxStorage } = getFullResourceCount(resource.id, spaceRock);
                  canClaim = resourceCount + resource.amount <= maxStorage;
                }
                return (
                  <Badge
                    key={resource.id}
                    className={`text-xs gap-2 badge-neutral ${!canClaim ? "border-error opacity-60 bg-error" : ""}`}
                  >
                    <ResourceIconTooltip
                      name={getBlockTypeName(resource.id)}
                      image={ResourceImage.get(resource.id) ?? BackgroundImage.get(resource.id)?.at(0) ?? ""}
                      resource={resource.id}
                      amount={resource.amount}
                      resourceType={resource.type}
                      direction="top"
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClaimObjectiveButton objectiveEntity={objective} />
    </SecondaryCard>
  );
};

const UnclaimedObjective: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
  const player = Account.use()?.value ?? singletonEntity;
  const time = Time.use()?.value;
  const objectives = Object.values(ObjectiveEntityLookup);

  const filteredObjectives = useMemo(() => {
    return objectives.filter((objective) => {
      const isAvailable = getIsObjectiveAvailable(objective, player);

      const claimed =
        comps.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ?? false;

      return isAvailable && !claimed;
    });
  }, [time]);

  if (player === singletonEntity) return <></>;

  return (
    <div className="grid grid-cols-2 gap-2 w-full h-full">
      {filteredObjectives.length === 0 ? (
        <SecondaryCard className="w-full h-full col-span-2 items-center justify-center text-xs">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectives.map((objective, i) => {
          return <Objective key={i} objective={objective} highlight={objective === highlight} />;
        })
      )}
    </div>
  );
};

const ClaimedObjective: React.FC = () => {
  const player = Account.use()?.value ?? singletonEntity;

  const filteredObjectives = Object.values(ObjectiveEntityLookup).filter((objective) => {
    const claimed =
      comps.CompletedObjective.getWithKeys({ entity: player as Hex, objective: objective as Hex })?.value ?? false;

    return claimed;
  });

  return (
    <div className="grid grid-cols-2 gap-2 w-full h-full">
      {filteredObjectives.length === 0 ? (
        <SecondaryCard className="w-full h-full items-center justify-center text-xs col-span-2">
          <p className="opacity-50 font-bold">NO COMPLETED OBJECTIVES</p>
        </SecondaryCard>
      ) : (
        filteredObjectives.map((objective, i) => {
          return <Objective key={i} objective={objective} />;
        })
      )}
    </div>
  );
};

export const Objectives: React.FC<{ highlight?: Entity }> = ({ highlight }) => {
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
        <UnclaimedObjective highlight={highlight} />
      </Tabs.Pane>
      <Tabs.Pane className="border-none w-full" index={1}>
        <ClaimedObjective />
      </Tabs.Pane>
    </Tabs>
  );
};
