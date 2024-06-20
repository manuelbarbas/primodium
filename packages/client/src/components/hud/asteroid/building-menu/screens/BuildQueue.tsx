import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useCore } from "@primodiumxyz/core/react";
import { getEntityTypeName } from "@primodiumxyz/core";
import { EntityToUnitImage } from "@/util/image";

export const BuildQueue: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables } = useCore();
  const rawQueue = tables.TrainingQueue.use(building);

  const queue = rawQueue ? convertTrainingQueue(rawQueue) : [];

  const active = queue.shift();

  return (
    <Navigator.Screen title="BuildQueue" className="!w-96 pointer-events-auto">
      {active && (
        <ProgressBar
          index={0}
          progress={active.progress}
          unit={active.unit}
          count={active.count}
          timeRemaining={active.timeRemaining}
          key={`queue-${0}`}
        />
      )}
      <SecondaryCard className="h-44 overflow-y-auto scrollbar w-full">
        <TransactionQueueMask
          queueItemId={"TRAIN" as Entity}
          className="text-sm font-bold text-slate-400 h-full flex items-center justify-center"
        >
          {(!queue || queue.length === 0) && "NO TRAINING ORDERS QUEUED"}
          {queue && queue.length !== 0 && (
            <div className="w-full space-y-1">
              {queue.map(({ unit, progress, count, timeRemaining }, i) => (
                <ProgressBar
                  index={i + 1}
                  progress={progress}
                  unit={unit}
                  count={count}
                  timeRemaining={timeRemaining}
                  key={`queue-${i + 1}`}
                />
              ))}
            </div>
          )}
        </TransactionQueueMask>
      </SecondaryCard>
      <div className="mt-2 flex gap-2 mx-auto">
        <Navigator.NavButton to="BuildUnit" className="btn-sm btn-secondary">
          + Add Build Order
        </Navigator.NavButton>
        <Navigator.BackButton className="btn-sm border-secondary" />
      </div>
    </Navigator.Screen>
  );
};

const ProgressBar: React.FC<{
  index: number;
  unit: Entity;
  progress: bigint;
  count: bigint;
  timeRemaining: bigint;
}> = ({ index, unit, count, progress, timeRemaining }) => {
  const unitsLeft = Math.ceil(Number((100n - progress) * count) / 100);
  if (index === 0) {
    return (
      <SecondaryCard key={index} className={`w-full text-sm flex-row justify-between p-2 mb-1`}>
        <div className="flex gap-2 items-center justify-center">{getEntityTypeName(unit)}</div>
        <div>
          <div className="relative flex gap-1 p-1 bg-slate-600 items-center">
            <img
              key={`unit-${index}`}
              src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
              className={`border border-cyan-400 w-7 h-7 rounded-xs`}
            />

            <p className="bg-cyan-700 text-xs p-1">x{unitsLeft.toString()} REMAINING</p>
          </div>
          <p className="min-w-fit w-full bg-slate-900 text-xs text-center mt-1">
            {Number(timeRemaining)} SECS TILL NEXT
          </p>
        </div>
      </SecondaryCard>
    );
  }

  return (
    <SecondaryCard key={index} className="flex flex-row justify-between p-2 w-full text-xs !bg-neutral border-0">
      <div className="flex gap-2 items-center justify-center">
        <p className="text-slate-400"> {index}.</p>
        {getEntityTypeName(unit)}
      </div>
      <div className="relative flex gap-1 p-1 bg-slate-600 items-center">
        <img
          key={`unit-${index}`}
          src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
          className={`border border-cyan-400 w-4 h-4 rounded-xs`}
        />
        <p className="bg-cyan-700 text-xs p-1">x{count.toLocaleString()}</p>
      </div>
    </SecondaryCard>
  );
};

const convertTrainingQueue = (raw: {
  units: Entity[];
  progress: bigint[];
  timeRemaining: bigint[];
  counts: bigint[];
}) => {
  return raw.units.map((unit, index) => ({
    unit,
    progress: raw.progress[index],
    timeRemaining: raw.timeRemaining[index],
    count: raw.counts[index],
  }));
};
