import { EntityID } from "@latticexyz/recs";
import React, { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { Level, MainBase } from "src/network/components/chainComponents";
import { TrainingQueue } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage, BlockType, RESOURCE_SCALE, ResourceImage, ResourceType } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { MiningResearchTree, getResearchInfo } from "src/util/research";
import { getRecipe } from "src/util/resource";
import { research, train } from "src/util/web3";

const AddSlot: React.FC<{
  recipe: {
    id: EntityID;
    type: ResourceType;
    amount: number;
  }[];
  level: number;
  index: number;
  researchId: EntityID;
  player: EntityID;
  mainBaseLvlReq: number;
}> = ({ recipe, level, index, researchId, player, mainBaseLvlReq }) => {
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const network = useMud();

  const mainBaseEntity = MainBase.use(player, {
    value: "-1" as EntityID,
  }).value;

  const mainBaseLevel = Level.use(mainBaseEntity, {
    value: 0,
  }).value;

  return (
    <div className="space-y-1">
      <Button
        className="w-[5.2rem] h-[5.2rem] flex-row items-center justify-center border-secondary p-1"
        loading={transactionLoading}
        disabled={index !== level || mainBaseLvlReq > mainBaseLevel}
        onClick={() => research(researchId, network)}
      >
        <p className="text-[.7rem] text-center">+ ADD SLOT</p>
      </Button>
      {index === level && mainBaseLevel >= mainBaseLvlReq && (
        <div className="flex flex-wrap gap-1 px-2">
          {recipe.length !== 0 &&
            recipe.map((resource) => {
              return (
                <Badge key={resource.id + resource.type} className="text-xs gap-2">
                  <ResourceIconTooltip
                    name={getBlockTypeName(resource.id)}
                    image={ResourceImage.get(resource.id) ?? ""}
                    resourceId={resource.id}
                    amount={resource.amount}
                    resourceType={resource.type}
                    scale={resource.type === ResourceType.Utility ? 1 : RESOURCE_SCALE}
                    direction="top"
                    validate
                  />
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
};

const CommissionVessel: React.FC<{
  player: EntityID;
  building: EntityID;
}> = ({ player, building }) => {
  const network = useMud();
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const recipe = useMemo(() => {
    const playerUnitEntity = hashKeyEntity(BlockType.MiningVessel, player);
    const level = Level.get(playerUnitEntity, { value: 0 }).value;
    const unitEntity = hashKeyEntity(BlockType.MiningVessel, level);

    return getRecipe(unitEntity);
  }, [player]);

  const hasEnough = useHasEnoughResources(recipe);

  return (
    <div className="space-y-1">
      <Button
        className={`w-[5.2rem] h-[5.2rem] flex-row items-center justify-center border-secondary p-1`}
        loading={transactionLoading}
        disabled={!hasEnough}
        onClick={() => train(building, BlockType.MiningVessel, 1, network)}
      >
        <p className="text-[.7rem] text-center">+ COMMISSION VESSEL</p>
      </Button>
    </div>
  );
};

const QueuedVessel: React.FC<{
  queuedItem: ReturnType<typeof convertTrainingQueue>[0];
  active: boolean;
}> = ({ queuedItem, active }) => {
  if (queuedItem.progress >= 1) return <></>;

  return (
    <div className="space-y-1">
      <Button
        className={`w-[5.2rem] h-[5.2rem] flex-row items-center justify-center border-secondary p-1 animate-pulse inline-flex`}
      >
        <img src={BackgroundImage.get(BlockType.MiningVessel)?.at(0)} className="h-8 pixel-images" />
      </Button>
      <p className="min-w-fit w-full bg-slate-900 text-xs text-center rounded-md mt-1">
        {active ? queuedItem.timeRemaining + " BLOCKS LEFT" : "QUEUED"}
      </p>
    </div>
  );
};

const BuiltVessel = () => {
  return (
    <div className="space-y-1">
      <Button className={`w-[5.2rem] h-[5.2rem] flex-row items-center justify-center border-secondary p-1 inline-flex`}>
        <img src={BackgroundImage.get(BlockType.MiningVessel)?.at(0)} className="h-8 pixel-images" />
      </Button>
    </div>
  );
};

export const VesselSlots: React.FC<{
  building: EntityID;
  player: EntityID;
}> = ({ building, player }) => {
  const { resourceCount, resourcesToClaim } = useFullResourceCount(BlockType.VesselCapacity, ResourceType.Utility);

  const rawQueue = TrainingQueue.use(building);

  const queue = useMemo(() => {
    return rawQueue ? convertTrainingQueue(rawQueue) : [];
  }, [rawQueue]);

  const { level, maxLevel, recipe, id, mainBaseLvlReq } = getResearchInfo(MiningResearchTree, player);

  const miningVesselCount = resourceCount + resourcesToClaim - queue.length;
  const addSlots = maxLevel - level;
  const commisionSlots = level - miningVesselCount - queue.length;

  return (
    <SecondaryCard className="w-full grid gap-2 grid-cols-5">
      {Array(miningVesselCount)
        .fill(0)
        .map((_, index) => {
          return <BuiltVessel key={index} />;
        })}
      {queue.map((item, index) => {
        return <QueuedVessel key={index} active={index === 0} queuedItem={item} />;
      })}
      {commisionSlots > 0 &&
        Array(commisionSlots)
          .fill(0)
          .map((_, index) => {
            return <CommissionVessel key={index} player={player} building={building} />;
          })}
      {addSlots > 0 &&
        Array(addSlots)
          .fill(0)
          .map((_, index) => {
            return (
              <AddSlot
                key={level + index}
                researchId={id}
                index={level + index}
                level={level}
                recipe={recipe}
                player={player}
                mainBaseLvlReq={mainBaseLvlReq}
              />
            );
          })}
    </SecondaryCard>
  );
};

const convertTrainingQueue = (raw: {
  units: EntityID[];
  progress: number[];
  timeRemaining: number[];
  counts: number[];
}) => {
  return raw.units
    .map((unit, index) => ({
      unit,
      progress: raw.progress[index],
      timeRemaining: raw.timeRemaining[index],
      count: raw.counts[index],
    }))
    .filter((item) => item.progress < 1);
};
