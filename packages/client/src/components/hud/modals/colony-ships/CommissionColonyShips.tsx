import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { TrainColonyShip } from "@/components/hud/modals/colony-ships/TrainColonyShip";
import { UnlockSlot } from "@/components/hud/modals/colony-ships/UnlockSlot";
import { useMud } from "@/hooks";
import { useColonySlots } from "@/hooks/useColonySlots";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { getBuildingImage } from "@/util/building";
import { ResourceImage } from "@/util/constants";
import { formatTime } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import React from "react";
import { FaPlus } from "react-icons/fa";

type Tile =
  | { type: "training"; unit: Entity; progress: bigint; timeRemaining: bigint; count: bigint }
  | { type: "train" }
  | { type: "unlock" }
  | { type: "blank" };

export const CommissionColonyShips: React.FC<{ buildingEntity: Entity }> = ({ buildingEntity }) => {
  const [activeTile, setActiveTile] = React.useState<number | null>(null);
  const primodium = usePrimodium();
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const asteroid = components.OwnedBy.use(buildingEntity)?.value as Entity;
  if (!asteroid) throw new Error("[ColonyShipData] No asteroid selected");

  const buildingImage = getBuildingImage(primodium, buildingEntity);
  const colonySlotsData = useColonySlots(playerEntity);

  const rawQueue = components.TrainingQueue.use(buildingEntity);

  const queue = rawQueue ? convertTrainingQueue(rawQueue) : [];
  console.log(queue);

  const tiles = Array(9)
    .fill(0)
    .map((_, i) => {
      if (i < queue.length) return { type: "training", ...queue[i] };
      if (i < Number(colonySlotsData.availableSlots)) return { type: "train" };
      if (i == Number(colonySlotsData.availableSlots)) return { type: "unlock" };
      return { type: "blank" };
    }) as Tile[];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <img src={buildingImage} className="h-10" />
        Shipyard
      </div>
      <div className="flex gap-2">
        <div className="grid grid-rows-3 grid-cols-3 gap-1 aspect-square">
          {tiles.map((tile, i) => {
            if (tile.type === "training") {
              return <TrainingTile training={tile} key={`tile-${i}`} />;
            }

            if (tile.type === "train")
              return <TrainShipTile onClick={() => setActiveTile(i)} key={`tile-${i}`} active={activeTile == i} />;
            if (tile.type === "unlock")
              return <UnlockTile key={`tile-${i}`} onClick={() => setActiveTile(i)} active={activeTile == i} />;
            return <BlankTile key={`tile-${i}`} />;
          })}
        </div>
        {activeTile !== null && tiles[activeTile].type === "train" && (
          <TrainColonyShip buildingEntity={buildingEntity} className="w-64 h-full" />
        )}
        {activeTile !== null && tiles[activeTile].type === "unlock" && (
          <UnlockSlot
            asteroidEntity={asteroid}
            buildingEntity={buildingEntity}
            playerEntity={playerEntity}
            index={activeTile}
            className="w-64 h-full"
          />
        )}
      </div>
    </div>
  );
};

const BlankTile: React.FC = () => {
  return (
    <SecondaryCard className="w-full h-full flex text-xs justify-center items-center opacity-50">{null}</SecondaryCard>
  );
};

const TrainingTile: React.FC<{
  training: { unit: Entity; progress: bigint; timeRemaining: bigint; count: bigint };
}> = ({ training }) => {
  return (
    <SecondaryCard className="w-full h-full justify-center items-center flex flex-col gap-1">
      <div className="flex gap-2 items-center">
        <img src={ResourceImage.get(training.unit) ?? ""} className="h-6" />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="text-xs text-warning animate-pulse">Training</div>
        <div className="text-xs opacity-50">{formatTime(training.timeRemaining)}</div>
      </div>
    </SecondaryCard>
  );
};

const TrainShipTile: React.FC<{ active?: boolean; onClick?: () => void }> = ({ onClick, active }) => {
  return (
    <SecondaryCard className={`w-full h-full !p-0 ${active ? "ring ring-secondary" : ""}`}>
      <Button onClick={onClick} variant="ghost" className="w-full h-full flex text-xs justify-center items-center">
        + Ship
      </Button>
    </SecondaryCard>
  );
};

const UnlockTile: React.FC<{ active?: boolean; onClick?: () => void }> = ({ onClick, active }) => {
  return (
    <SecondaryCard className={`w-full h-full !p-0 ${active ? "ring ring-secondary" : ""}`}>
      <Button onClick={onClick} variant="ghost" className="w-full h-full flex text-xs justify-center items-center">
        <FaPlus /> Add Slot
      </Button>
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
