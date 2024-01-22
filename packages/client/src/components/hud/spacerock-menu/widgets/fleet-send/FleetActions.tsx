import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ESendType } from "contracts/config/enums";
import { useCallback, useMemo } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Modal } from "src/components/core/Modal";
import { useMud } from "src/hooks";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { components } from "src/network/components";
import { formatNumber } from "src/util/number";
import { Hex } from "viem";
import { DefenseLabel } from "../resources/utilities/DefenseLabel";
import { Land } from "./Land";
import { Recall } from "./Recall";
import { SendFleet } from "./SendFleet";

export const FleetActions = () => {
  const { playerEntity } = useMud().network;
  const selectedAsteroid = components.SelectedRock.use()?.value as Entity | undefined;
  const owner = components.OwnedBy.use(selectedAsteroid)?.value as Entity | undefined;
  const units = components.Hangar.use(selectedAsteroid ?? singletonEntity);
  const fleetMoves = useFleetMoves();
  const orbitingFleets = components.Arrival.use({
    from: playerEntity,
    onlyOrbiting: true,
    destination: selectedAsteroid ?? singletonEntity,
  }).filter((elem) => elem?.sendType !== ESendType.Reinforce);

  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!units) return 0n;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0n;
      return units.counts[index];
    },
    [units]
  );

  const attack = useMemo(
    () =>
      units?.units.reduce((acc, unit) => {
        const level =
          components.UnitLevel.getWithKeys({ entity: (owner ?? playerEntity) as Hex, unit: unit as Hex })?.value ?? 0n;
        const arrivalAttack =
          (components.P_Unit.getWithKeys({ entity: unit as Hex, level })?.attack ?? 0n) * getUnitCount(unit);
        return acc + arrivalAttack;
      }, 0n),
    [units, owner, playerEntity, getUnitCount]
  );
  if (!selectedAsteroid) return null;

  return (
    <div className="flex flex-col items-center gap-1 m-1">
      <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
        {orbitingFleets.length === 0 && (
          <Modal title="Send Fleet">
            <Modal.Content className="w-[51rem] h-[25rem]">
              <SendFleet />
            </Modal.Content>
            <Modal.IconButton
              disabled={!fleetMoves}
              className="btn-md btn-secondary"
              imageUri="/img/icons/outgoingicon.png"
              text="send fleet"
            />
          </Modal>
        )}
        {selectedAsteroid && <Land destination={selectedAsteroid} />}
      </SecondaryCard>
      <div className="text-xs opacity-75 font-bold w-full flex justify-around items-center mb-1 gap-2">
        <Badge className="flex items-center gap-1">
          <DefenseLabel />
          {playerEntity === owner && (
            <IconLabel
              imageUri="/img/icons/attackicon.png"
              tooltipText="Attack"
              className="text-sm"
              text={attack ? formatNumber(attack, { short: true, fractionDigits: 2 }) : "-"}
            />
          )}
        </Badge>

        {playerEntity === owner && (
          <Badge className="gap-1 items-center">
            <div className="animate-pulse bg-success w-1 h-1 rounded-box" />0 ATTACKING FLEETS
            <FaExternalLinkAlt className="opacity-75 scale-90" />
          </Badge>
        )}
        <Modal title="Recall">
          <Modal.Content className="w-[51rem]">
            <Recall rock={selectedAsteroid} />
          </Modal.Content>
          <Modal.IconButton className="btn-xs" imageUri="/img/icons/mainbaseicon.png" text="recall" />
        </Modal>
      </div>
    </div>
  );
};
