import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { TrainColonyShip } from "@/components/hud/global/modals/colony-ships/TrainColonyShip";
import { UnlockSlot } from "@/components/hud/global/modals/colony-ships/UnlockSlot";
import { useMud } from "@/hooks";
import { useColonySlots } from "@/hooks/useColonySlots";
import { components } from "@/network/components";
import { EntityType } from "@/util/constants";
import { EntityToUnitImage } from "@/util/mappings";
import { entityToRockName } from "@/util/name";
import { formatTime } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import React from "react";
import { Navigator } from "src/components/core/Navigator";

type Tile =
  | { type: "training"; unit: Entity; progress: bigint; timeRemaining: bigint; count: bigint }
  | { type: "train" }
  | { type: "unlock" };

export const CommissionColonyShips: React.FC<{ buildingEntity: Entity }> = ({ buildingEntity }) => {
  const [activeTile, setActiveTile] = React.useState<number | null>(null);
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const asteroid = components.OwnedBy.use(buildingEntity)?.value as Entity;
  if (!asteroid) throw new Error("[ColonyShipData] No asteroid selected");

  const colonySlotsData = useColonySlots(playerEntity);

  const trainingShips = colonySlotsData.occupiedSlots.filter(
    (slot): slot is typeof slot & { type: "training" } => slot.type === "training"
  );
  const rawQueue = components.TrainingQueue.use(buildingEntity);

  const queue = rawQueue ? convertTrainingQueue(rawQueue) : [];

  const tiles: Tile[] = Array(Number(colonySlotsData.availableSlots)).fill({ type: "train" });
  tiles.push({ type: "unlock" });

  return (
    <Navigator.Screen title="Commission" className="gap-2">
      <div className="flex h-[22rem] gap-2">
        <div className="flex flex-col gap-2 ">
          <div className="px-1">
            {queue.length > 0 ? (
              <TrainingTile timeRemaining={queue[0].timeRemaining} className="h-[6rem]" />
            ) : colonySlotsData.availableSlots > 0 ? (
              <TrainShipTile
                onClick={() => setActiveTile(0)}
                className={`h-[6rem] ${activeTile == 0 ? "ring ring-secondary" : ""}`}
              />
            ) : (
              <SecondaryCard noDecor className="h-[6rem] w-full opacity-50 text-xs flex justify-center items-center">
                Add slots to train ships
              </SecondaryCard>
            )}
          </div>
          <div className="text-xs px-1 pt-1 flex justify-between">
            <p>Colony Ship Slots</p>
            <p>
              {colonySlotsData.occupiedSlots.length - 1}/
              {colonySlotsData.occupiedSlots.length + Number(colonySlotsData.availableSlots) - 1} slots
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1 overflow-auto scrollbar p-1">
            {trainingShips.map((slot, index) => (
              <TrainingTile key={index} timeRemaining={slot.timeRemaining} asteroidEntity={slot.asteroidEntity} />
            ))}
            {tiles.map((tile, index) => {
              if (tile.type === "train") {
                return (
                  <SecondaryCard
                    key={`tile-${index}`}
                    noDecor
                    className="aspect-square text-xs flex justify-center items-center"
                  >
                    <img src={EntityToUnitImage[EntityType.ColonyShip] ?? ""} className="h-6 mb-1" />
                    <div className="flex flex-col flex-grow items-center justify-center">
                      <p className="text-success">Ready to</p>
                      <p className="text-success">Commission</p>
                    </div>
                  </SecondaryCard>
                );
              }
              if (tile.type === "unlock")
                return (
                  <UnlockTile key={index} onClick={() => setActiveTile(index + 1)} active={activeTile == index + 1} />
                );
            })}
          </div>
        </div>
        {activeTile === 0 && (
          <TrainColonyShip
            buildingEntity={buildingEntity}
            className="w-56 h-full"
            onCommission={() => setActiveTile(null)}
          />
        )}
        {!!activeTile && tiles[activeTile - 1].type === "unlock" && (
          <UnlockSlot
            asteroidEntity={asteroid}
            buildingEntity={buildingEntity}
            playerEntity={playerEntity}
            index={activeTile}
            className="w-56 h-full"
          />
        )}
        {(!activeTile || ["training", "train"].includes(tiles[activeTile - 1].type)) &&
          (activeTile === 0 ? null : (
            <SecondaryCard noDecor className="w-56 h-full flex text-xs justify-center items-center opacity-50">
              Select a Slot
            </SecondaryCard>
          ))}
      </div>

      <div className="flex justify-center w-full">
        <Navigator.BackButton className="w-fit" />
      </div>
    </Navigator.Screen>
  );
};

const TrainingTile: React.FC<{
  asteroidEntity?: Entity;
  timeRemaining: bigint;
  className?: string;
}> = ({ timeRemaining, asteroidEntity, className = "" }) => {
  return (
    <SecondaryCard noDecor className={`w-full justify-center items-center flex flex-col gap-1 ${className}`}>
      <img src={EntityToUnitImage[EntityType.ColonyShip] ?? ""} className="h-6 mb-1" />
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="text-xs text-warning animate-pulse">{timeRemaining === 0n ? "IN QUEUE" : "Building"}</div>
        {timeRemaining > 0n && <div className="text-xs opacity-70"> {formatTime(timeRemaining)}</div>}
        {asteroidEntity && <div className="text-xs text-accent opacity-50">{entityToRockName(asteroidEntity)}</div>}
      </div>
    </SecondaryCard>
  );
};

const TrainShipTile: React.FC<{ active?: boolean; onClick?: () => void; className?: string }> = ({
  onClick,
  active,
  className,
}) => {
  return (
    <SecondaryCard className={`w-full h-full !p-0 ${active ? "ring ring-secondary" : ""} ${className}`}>
      <Button
        motion="disabled"
        onClick={onClick}
        variant="ghost"
        className="w-full h-full flex gap-2 text-xs justify-center items-center"
      >
        <img src={InterfaceIcons.Add} className={`pixel-images w-4 scale-150`} />
        <div className="flex flex-col flex-grow">
          <p>Commission Ship</p>
        </div>
      </Button>
    </SecondaryCard>
  );
};

const UnlockTile: React.FC<{ active?: boolean; onClick?: () => void }> = ({ onClick, active }) => {
  return (
    <SecondaryCard className={`aspect-square min-h-24 w-full !p-0 ${active ? "ring ring-secondary" : ""}`}>
      <Button
        motion="disabled"
        onClick={onClick}
        variant="ghost"
        className="w-full h-full flex text-xs justify-center items-center"
      >
        + Add Slot
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
