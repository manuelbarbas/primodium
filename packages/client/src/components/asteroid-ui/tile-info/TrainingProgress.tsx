import { EntityID } from "@latticexyz/recs";
import { TrainingQueue } from "src/network/components/clientComponents";
import { BackgroundImage, BlockIdToKey } from "src/util/constants";

export const TrainingProgress: React.FC<{ building: EntityID }> = ({
  building,
}) => {
  const rawQueue = TrainingQueue.use(building);

  if (!rawQueue || rawQueue.units.length == 0) return null;
  const queue = convertTrainingQueue(rawQueue);
  return (
    <div className="bg-gray-900 z-[999] border rounded-md border-cyan-600 ring ring-cyan-900 p-2 text-xs flex flex-col gap-2 items-center w-64">
      <p>Training</p>
      {queue.map(({ unit, progress, count }, i) => (
        <ProgressBar
          index={i}
          progress={progress}
          unit={unit}
          count={count}
          key={`queue-${i}`}
        />
      ))}
    </div>
  );
};

const ProgressBar: React.FC<{
  index: number;
  unit: EntityID;
  progress: number;
  count: number;
}> = ({ index, unit, count, progress }) => {
  const unitsLeft = Math.ceil((1 - progress) * count);
  return (
    <div className="relative w-full h-4 bg-gray-800 opacity-50 h-4">
      <div className="z-10 text-white flex gap-1 h-4">
        <p className="mr-2">
          {index + 1}. {BlockIdToKey[unit]}
        </p>

        {Array(unitsLeft)
          .fill(0)
          .map((unit, i) => (
            <img
              key={`unit-${i}`}
              src={
                BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"
              }
              className={`border border-cyan-400 w-4 h-4 rounded-xs`}
            />
          ))}
      </div>
    </div>
  );
};

const convertTrainingQueue = (raw: {
  units: EntityID[];
  progress: number[];
  counts: number[];
}) => {
  return raw.units.map((unit, index) => ({
    unit,
    progress: raw.progress[index],
    count: raw.counts[index],
  }));
};
