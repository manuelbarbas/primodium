import { Card } from "@/components/core/Card";
import { List } from "@/components/core/List";
import { Modal } from "@/components/core/Modal";
import { ObjectivesScreen } from "@/components/hud/modals/objectives/ObjectivesScreen";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { getEntityTypeName } from "@/util/common";
import { ObjectiveEntityLookup } from "@/util/constants";
import { canShowObjective, getCanClaimObjective } from "@/util/objectives/objectiveRequirements";
import { Objectives } from "@/util/objectives/objectives";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";
import { Hex } from "viem";

export const BeginnerObjectives = () => {
  const player = useMud().playerAccount.entity;
  const asteroid = components.ActiveRock.use()?.value;
  const asteroidOwner = components.OwnedBy.use(asteroid)?.value;

  const time = components.Time.use()?.value;

  const incompleteObjectives = useMemo(() => {
    return [...Objectives.entries()].filter(([key]) => {
      const objectiveEntity = ObjectiveEntityLookup[key];
      return !components.CompletedObjective.hasWithKeys({ entity: player as Hex, objective: objectiveEntity as Hex });
    });
  }, [time, player]);

  if (incompleteObjectives.length === 0 || !asteroid || player !== asteroidOwner) return null;
  if (Objectives.size === 0) return null;

  return (
    <Card className="relative w-64">
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
        {incompleteObjectives.map(([key]) => (
          <BeginnerObjectiveItem
            playerEntity={player}
            asteroidEntity={asteroid}
            objectiveEntity={ObjectiveEntityLookup[key]}
            key={`objective-${key}`}
          />
        ))}
      </List>
    </Card>
  );
};

const BeginnerObjectiveItem = ({
  playerEntity,
  asteroidEntity,
  objectiveEntity,
}: {
  playerEntity: Entity;
  asteroidEntity: Entity;
  objectiveEntity: Entity;
}) => {
  const time = components.Time.use()?.value;
  const { claimable, canShow } = useMemo(
    () => ({
      claimable: getCanClaimObjective(playerEntity, asteroidEntity, objectiveEntity),
      canShow: canShowObjective(playerEntity, objectiveEntity),
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
