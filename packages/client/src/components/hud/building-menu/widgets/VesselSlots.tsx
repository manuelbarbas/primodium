import { Entity } from "@latticexyz/recs";
import { EResource, EUnit } from "contracts/config/enums";
import React, { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components, components as comps } from "src/network/components";
import { TrainingQueue } from "src/network/components/clientComponents";
import { train } from "src/network/setup/contractCalls/train";
import { BackgroundImage, EntityType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";

const AddSlot: React.FC = () => {
  return (
    <Button className="w-[5.2rem] h-[5.2rem] flex-row items-center justify-center border-secondary p-1" disabled={true}>
      <p className="text-[.7rem] text-center">UPGRADE BASE TO ADD SLOT</p>
    </Button>
  );
};

const CommissionVessel: React.FC<{
  index: number;
  player: Entity;
  building: Entity;
}> = ({ player, building, index }) => {
  const mud = useMud();
  const recipe = useMemo(() => {
    const level = comps.UnitLevel.getWithKeys(
      { entity: player as Hex, unit: EntityType.MiningVessel as Hex },
      { value: 0n }
    ).value;

    return getRecipe(EntityType.MiningVessel, level);
  }, [player]);

  const hasEnough = useHasEnoughResources(recipe);

  const queueIdHash = hashEntities(TransactionQueueType.Train, building, index);

  return (
    <TransactionQueueMask queueItemId={queueIdHash}>
      <Button
        className={`h-[5.2rem] w-full flex-row items-center justify-center border-secondary p-1`}
        disabled={!hasEnough}
        onClick={() => train(mud, building, EUnit.MiningVessel, 1n)}
      >
        <p className="text-[.7rem] text-center">
          + <br />
          VESSEL
        </p>
      </Button>
    </TransactionQueueMask>
  );
};

const QueuedVessel: React.FC<{
  queuedItem: ReturnType<typeof convertTrainingQueue>[0];
  active: boolean;
}> = ({ queuedItem, active }) => {
  if (queuedItem.progress >= 1) return <></>;

  return (
    <div className="relative">
      <Button className={`w-full h-[5.2rem] flex-row items-center justify-center border-secondary p-1 inline-flex`}>
        <img src={BackgroundImage.get(EntityType.MiningVessel)?.at(0)} className="h-8 pixel-images" />
      </Button>
      <p className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 h-fit animate-pulse opacity-90 margin-auto w-4/5 bg-slate-900 text-xs text-center rounded-md mt-1">
        {active ? queuedItem.timeRemaining + " SECS LEFT" : "QUEUED"}
      </p>
    </div>
  );
};

const BuiltVessel = () => {
  return (
    <Button
      className={`col-span-1 w-full h-[5.2rem] flex-row items-center justify-center border-secondary p-1 inline-flex`}
    >
      <img src={BackgroundImage.get(EntityType.MiningVessel)?.at(0)} className="h-8 pixel-images" />
    </Button>
  );
};

export const VesselSlots: React.FC<{
  building: Entity;
  player: Entity;
}> = ({ building, player }) => {
  // vessel capacity increases every level and decreases every vessel
  const { resourceCount: vesselsAvailable, resourceStorage: maxVessels } = useFullResourceCount(
    EntityType.VesselCapacity
  );

  console.log(vesselsAvailable, maxVessels);

  const rawQueue = TrainingQueue.use(building);
  const queue = useMemo(() => {
    return rawQueue ? convertTrainingQueue(rawQueue) : [];
  }, [rawQueue]);
  const vesselsInConstruction = BigInt(queue.length);
  const vesselsUsed = maxVessels - vesselsAvailable;
  const builtVessels = vesselsUsed - vesselsInConstruction;
  const queuedVessels = vesselsInConstruction;
  const availableVessels = maxVessels - (builtVessels + queuedVessels);

  const level = components.Level.use(building, { value: 0n }).value;
  const prototype = components.BuildingType.use(building, { value: EntityType.MainBase }).value as Hex;
  const nextLevelMaxVessels = components.P_Production.useWithKeys({ prototype, level: level + 1n });
  const nextLevelMaxVesselsIncrease =
    (nextLevelMaxVessels?.amounts[nextLevelMaxVessels?.resources.indexOf(EResource.U_Vessel) ?? 0] ?? 0n) - maxVessels;

  if (builtVessels > 100n || availableVessels > 100n) throw new Error("vessels available is too high");

  return (
    <SecondaryCard className="w-full grid gap-1 grid-cols-5">
      {Array(Number(builtVessels))
        .fill(0)
        .map((_, index) => {
          return <BuiltVessel key={index} />;
        })}
      {queue.map((item, index) => {
        return <QueuedVessel key={index} queuedItem={item} active={index === 0} />;
      })}
      {availableVessels > 0 &&
        Array(Number(availableVessels))
          .fill(0)
          .map((_, index) => {
            return <CommissionVessel key={index} player={player} building={building} index={index} />;
          })}
      {nextLevelMaxVesselsIncrease > 0n &&
        Array(Number(nextLevelMaxVesselsIncrease))
          .fill(0)
          .map((_, rawIndex) => <AddSlot key={`add-slot-${rawIndex}`} />)}
    </SecondaryCard>
  );
};

const convertTrainingQueue = (raw: {
  units: Entity[];
  progress: bigint[];
  timeRemaining: bigint[];
  counts: bigint[];
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
