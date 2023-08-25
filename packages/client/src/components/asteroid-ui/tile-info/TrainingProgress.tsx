import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { TrainingQueue } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";

export const TrainingProgress: React.FC<{ buildingEntity: EntityID }> = ({
  buildingEntity,
}) => {
  const rawQueue = TrainingQueue.use(buildingEntity);

  const queue = rawQueue ? convertTrainingQueue(rawQueue) : [];

  const active = queue.shift();

  return (
    <div>
      {active && (
        <div className="mb-4">
          <p className="text-xs p-1 font-bold text-slate-400">ACTIVE</p>
          <ProgressBar
            index={0}
            progress={active.progress}
            unit={active.unit}
            count={active.count}
            timeRemaining={active.timeRemaining}
            // timeRemainingToNextUnit={active.timeRemainingToNextUnit}
            key={`queue-${0}`}
          />
        </div>
      )}
      <p className="text-xs p-1 font-bold text-slate-400">QUEUE</p>
      <div className="rounded-md overflow-hidden h-44 border border-slate-500 bg-slate-800 overflow-y-auto flex flex-col items-center justify-center scrollbar">
        {(!queue || queue.length === 0) && (
          <p className="text-sm font-bold text-slate-400 text-center">
            NO TRAINING ORDERS QUEUED
          </p>
        )}
        {queue && queue.length !== 0 && (
          <div className="w-full h-full">
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
      </div>
    </div>
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
      <div
        key={index}
        className={`w-full border border-cyan-500 text-xs bg-slate-700 rounded-md `}
      >
        <div className="flex justify-between p-2">
          <div className="flex gap-2 items-center justify-center">
            {getBlockTypeName(unit)}
          </div>
          <div>
            <motion.div
              layout
              className="relative flex gap-1 p-1 bg-slate-600 rounded-md items-center"
            >
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
            </motion.div>
            <p className="min-w-fit w-full bg-slate-900 text-xs text-center rounded-md mt-1">
              {timeRemaining} BLOCKS TILL NEXT
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={index}
      className={`w-full border-b border-b-slate-700 text-xs bg-slate-800`}
    >
      <div className="flex justify-between p-2">
        <div className="flex gap-2 items-center justify-center">
          <p className="text-slate-400"> {index}.</p>
          {getBlockTypeName(unit)}
        </div>
        <motion.div
          layout
          className="relative flex gap-1 p-1 bg-slate-600 rounded-md items-center"
        >
          <img
            key={`unit-${index}`}
            src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
            className={`border border-cyan-400 w-4 h-4 rounded-xs`}
          />
          <p className="rounded-md bg-cyan-700 text-xs p-1">x{count}</p>
        </motion.div>
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
