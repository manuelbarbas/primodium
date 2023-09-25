import { EntityID } from "@latticexyz/recs";
import { SecondaryCard } from "src/components/core/Card";
import { Loader } from "src/components/core/Loader";
import { Navigator } from "src/components/core/Navigator";
import { TrainingQueue } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";

export const BuildQueue: React.FC<{ building: EntityID }> = ({ building }) => {
  const transactionLoading = useGameStore((state) => state.transactionLoading);

  const rawQueue = TrainingQueue.use(building);

  const queue = rawQueue ? convertTrainingQueue(rawQueue) : [];

  const active = queue.shift();

  return (
    <Navigator.Screen title="BuildQueue" className="w-full pointer-events-auto">
      {active && (
        <ProgressBar
          index={0}
          progress={active.progress}
          unit={active.unit}
          count={active.count}
          timeRemaining={active.timeRemaining}
          // timeRemainingToNextUnit={active.timeRemainingToNextUnit}
          key={`queue-${0}`}
        />
      )}
      {/* <p className="text-xs p-1 font-bold text-slate-400">QUEUE</p> */}
      <SecondaryCard className="h-44 overflow-y-auto scrollbar w-full">
        {(!queue || queue.length === 0) && (
          <p className="text-sm font-bold text-slate-400 h-full flex items-center justify-center">
            {transactionLoading
              ? "QUEUING TRAINING ORDER..."
              : "NO TRAINING ORDERS QUEUED"}
          </p>
        )}
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
            {transactionLoading && <TrainingProgressSpinner />}
          </div>
        )}
      </SecondaryCard>
      <div className="mt-2 flex gap-2">
        <Navigator.NavButton to="BuildDrone" className="btn-sm btn-secondary">
          + Add Build Order
        </Navigator.NavButton>
        <Navigator.BackButton className="btn-sm border-secondary" />
      </div>
    </Navigator.Screen>
  );
};

const ProgressBar: React.FC<{
  index: number;
  unit: EntityID;
  progress: number;
  count: number;
  timeRemaining: number;
}> = ({ index, unit, count, progress, timeRemaining }) => {
  const unitsLeft = Math.ceil((1 - progress) * count);
  if (index === 0) {
    return (
      <SecondaryCard
        key={index}
        className={`w-full text-sm flex-row justify-between p-2`}
      >
        <div className="flex gap-2 items-center justify-center">
          {getBlockTypeName(unit)}
        </div>
        <div>
          <div className="relative flex gap-1 p-1 bg-slate-600 rounded-md items-center">
            <img
              key={`unit-${index}`}
              src={
                BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"
              }
              className={`border border-cyan-400 w-7 h-7 rounded-xs`}
            />

            <p className="rounded-md bg-cyan-700 text-xs p-1">
              x{unitsLeft} REMAINING
            </p>
          </div>
          <p className="min-w-fit w-full bg-slate-900 text-xs text-center rounded-md mt-1">
            {timeRemaining} BLOCKS TILL NEXT
          </p>
        </div>
      </SecondaryCard>
    );
  }

  return (
    <SecondaryCard
      key={index}
      className="flex flex-row justify-between p-2 w-full text-xs bg-neutral"
    >
      <div className="flex gap-2 items-center justify-center">
        <p className="text-slate-400"> {index}.</p>
        {getBlockTypeName(unit)}
      </div>
      <div className="relative flex gap-1 p-1 bg-slate-600 rounded-md items-center">
        <img
          key={`unit-${index}`}
          src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
          className={`border border-cyan-400 w-4 h-4 rounded-xs`}
        />
        <p className="rounded-md bg-cyan-700 text-xs p-1">x{count}</p>
      </div>
    </SecondaryCard>
  );
};

// In the style of ProgressBar above, but replace the contents with a Spinner that fits in with previous list items.
// This is used in packages/client/src/components/asteroid-ui/tile-info/TrainUnits.tsx
const TrainingProgressSpinner: React.FC = () => {
  return (
    <div className="w-full border-b-slate-700 text-xs bg-slate-800 flex items-center justify-center">
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center justify-center">
          <Loader />
        </div>
      </div>
    </div>
  );
};

const convertTrainingQueue = (raw: {
  units: EntityID[];
  progress: number[];
  timeRemaining: number[];
  counts: number[];
}) => {
  return raw.units.map((unit, index) => ({
    unit,
    progress: raw.progress[index],
    timeRemaining: raw.timeRemaining[index],
    count: raw.counts[index],
  }));
};
