import { Card } from "@/components/core/Card";
import { List } from "@/components/core/List";
import { Modal } from "@/components/core/Modal";
import { ObjectivesScreen } from "@/components/hud/modals/objectives/ObjectivesScreen";
import { usePersistentStore } from "@/game/stores/PersistentStore";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { cn } from "@/util/client";
import { getEntityTypeName } from "@/util/common";
import { ObjectiveEntityLookup } from "@/util/constants";
import { getCanClaimObjective } from "@/util/objectives/objectiveRequirements";
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
  const incompleteObjectives = useMemo(() => {
    return [...Objectives.entries()].filter(([key]) => {
      const objectiveEntity = ObjectiveEntityLookup[key];
      return !components.CompletedObjective.hasWithKeys({ entity: player as Hex, objective: objectiveEntity as Hex });
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
  if (incompleteObjectives.length === 0 || !asteroid || player !== asteroidOwner) return null;

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
      }, 3000)
    ); // 5000 milliseconds = 5 seconds
  };

  return (
    <div className="relative w-64 h-40 flex justify-end items-center">
      <div
        className="pointer-events-auto flex flex-row gap-1 items-center justify-center"
        style={{ writingMode: "vertical-lr" }}
        onMouseEnter={handleHover}
      >
        Objectives <FaExclamationCircle className="text-warning rotate-90" />
      </div>
      <div
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleHover}
        // className="absolute right-0 top-0 animate"
        className={cn(
          "absolute right-0 top-0 transition-transform duration-150 ease-in-out",
          !showObjectives && "translate-x-full"
        )}

        // style={{
        //   transition: "transform 150ms ease-in-out",
        //   transform: showObjectives ? "" : `translate(100%,0)`,
        // }}
      >
        <Card className="absolute right-0 margin-auto relative">
          <div className="flex flex-col">
            <div className="absolute top-4 right-4 text-xs">
              {Objectives.size - incompleteObjectives.length}/{Objectives.size}
            </div>
            <div className="flex gap-2 items-center">
              <img src={InterfaceIcons.Objective} alt="Objectives" className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold">Objectives</h2>
                <p className="text-xs text-warning opacity-80">Recommended</p>
              </div>
            </div>
            <List>
              {incompleteObjectives.slice(0, 5).map(([key]) => (
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
        </Card>
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
  const { claimable, canShow } = useMemo(
    () => ({
      claimable: getCanClaimObjective(playerEntity, asteroidEntity, objectiveEntity),
      // canShow: canShowObjective(playerEntity, objectiveEntity),
      canShow: true,
    }),
    [time, asteroidEntity]
  );
  const claimed =
    components.CompletedObjective.useWithKeys({ entity: playerEntity as Hex, objective: objectiveEntity as Hex })
      ?.value ?? false;
  if (!canShow) return null;

  return (
    <List.Item strikethrough={claimed} active={claimable && !claimed} bullet>
      <Modal>
        <Modal.Button
          variant="ghost"
          className={`!p-0 !px-1 ${claimable && !claimed ? "text-warning" : ""}`}
          disabled={!canShow || claimed}
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
