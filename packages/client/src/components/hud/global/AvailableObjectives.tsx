import { SecondaryCard } from "@/components/core/Card";
import { List } from "@/components/core/List";
import { Modal } from "@/components/core/Modal";
import { ObjectivesScreen } from "@/components/hud/global/modals/objectives/ObjectivesScreen";
import { usePersistentStore } from "@/game/stores/PersistentStore";
import { useMud } from "@/react/hooks";
import { components } from "@/network/components";
import { cn } from "@/util/client";
import { getEntityTypeName } from "@/util/common";
import { ObjectiveEntityLookup } from "@/util/constants";
import { canShowObjective, getCanClaimObjective } from "@/util/objectives/objectiveRequirements";
import { Objectives } from "@/util/objectives/objectives";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect, useMemo, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { Hex } from "viem";
import { useShallow } from "zustand/react/shallow";

export const AvailableObjectives = () => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const player = useMud().playerAccount.entity;
  const asteroid = components.ActiveRock.use()?.value;
  const asteroidOwner = components.OwnedBy.use(asteroid)?.value;

  const time = components.Time.use()?.value;
  const { showObjectives, setShowObjectives } = usePersistentStore(
    useShallow((state) => ({ setShowObjectives: state.setShowObjectives, showObjectives: state.showObjectives }))
  );
  const availableObjectives = useMemo(() => {
    return [...Objectives.entries()].filter(([key]) => {
      const objectiveEntity = ObjectiveEntityLookup[key];

      const completed = components.CompletedObjective.hasWithKeys({
        entity: player as Hex,
        objective: objectiveEntity as Hex,
      });

      if (completed) return false;

      const canShow = canShowObjective(player, objectiveEntity);

      if (!canShow) return false;
      return true;
    });
  }, [time, player]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    };
  }, []);

  if (Objectives.size === 0) return null;
  if (availableObjectives.length === 0 || !asteroid || player !== asteroidOwner) return null;

  const handleHover = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setShowObjectives(true);
  };

  const handleMouseLeave = () => {
    setTimeoutId(
      setTimeout(() => {
        setShowObjectives(false);
      }, 1000)
    );
  };

  return (
    <div className="relative w-64 flex justify-end items-center">
      <div
        className={cn(
          "pointer-events-auto flex flex-row gap-1 items-center justify-center pr-2",
          showObjectives && "opacity-0"
        )}
        style={{ writingMode: "vertical-lr" }}
        onMouseEnter={handleHover}
      >
        <FaExclamationCircle className="text-warning rotate-90 animate-pulse" /> Objectives
      </div>
      <div
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleHover}
        className={cn(
          "absolute right-0 top-0 transition-transform duration-150 ease-in-out",
          !showObjectives && "translate-x-full"
        )}
      >
        <SecondaryCard className="w-72 relative bg-gradient-to-br from-neutral to-neutral/25 border-r-0 p-3">
          <div className="flex flex-col">
            <div className="flex gap-2 w-full justify-between items-center">
              <div className="flex gap-2 items-center">
                <img src={InterfaceIcons.Objective} alt="Objectives" className="w-6 h-6" />
                <div>
                  <h2 className="text-md font-bold">Objectives</h2>
                  <p className="text-xs text-warning opacity-80">Recommended</p>
                </div>
              </div>

              <p className="text-xs">{availableObjectives.length} AVAIL.</p>
            </div>
            <List className="pl-3 pt-2">
              {availableObjectives.slice(0, 5).map(([key]) => (
                <AvailableObjectiveItem
                  onClick={() => setShowObjectives(false)}
                  playerEntity={player}
                  asteroidEntity={asteroid}
                  objectiveEntity={ObjectiveEntityLookup[key]}
                  key={`objective-${key}`}
                />
              ))}
            </List>
          </div>
        </SecondaryCard>
      </div>
    </div>
  );
};

const AvailableObjectiveItem = ({
  playerEntity,
  asteroidEntity,
  objectiveEntity,
  onClick = () => null,
}: {
  playerEntity: Entity;
  asteroidEntity: Entity;
  objectiveEntity: Entity;
  onClick?: () => void;
}) => {
  const time = components.Time.use()?.value;
  const claimable = useMemo(
    () => getCanClaimObjective(playerEntity, asteroidEntity, objectiveEntity),
    [time, asteroidEntity]
  );

  const claimed =
    components.CompletedObjective.useWithKeys({ entity: playerEntity as Hex, objective: objectiveEntity as Hex })
      ?.value ?? false;

  return (
    <List.Item strikethrough={claimed} active={claimable && !claimed} bullet>
      <Modal>
        <Modal.Button
          variant="ghost"
          className={`!p-0 !px-1 ${claimable && !claimed ? "text-warning" : ""}`}
          disabled={claimed}
          onClick={onClick}
        >
          {getEntityTypeName(objectiveEntity)}
        </Modal.Button>
        <Modal.Content className="w-[50rem] h-[60rem]">
          <ObjectivesScreen highlight={objectiveEntity} />
        </Modal.Content>
      </Modal>
    </List.Item>
  );
};
