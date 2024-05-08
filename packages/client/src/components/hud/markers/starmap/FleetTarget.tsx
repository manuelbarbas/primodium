import { Mode } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { IconLabel } from "src/components/core/IconLabel";
import { Marker } from "src/components/core/Marker";
import { Modal } from "src/components/core/Modal";
import { DepthLayers } from "src/game/lib/constants/common";
import { useMud } from "src/hooks";
import { useInCooldownEnd } from "src/hooks/useCooldownEnd";
import { useGame } from "src/hooks/useGame";
import { useSpaceRock } from "src/hooks/useSpaceRock";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { clearFleetStance } from "src/network/setup/contractCalls/fleetStance";
import { getCanAttackSomeone, getFleetStats } from "src/util/unit";
import { Fleets } from "../../widgets/fleets/Fleets";

// this component assumes the fleet is owned by the player
export const _FleetTarget: React.FC<{ fleet: Entity; position: Entity }> = ({ fleet, position }) => {
  const game = useGame();
  const mapOpen = components.SelectedMode.use()?.value !== Mode.Asteroid;
  const selectingAttackDestination = !!components.Attack.use()?.originFleet;
  const selectingMoveDestination = !!components.Send.use()?.originFleet;
  const noUnits = useUnitCounts(fleet).size === 0;
  const stats = getFleetStats(fleet);
  const spaceRockData = useSpaceRock(position);
  const { inCooldown } = useInCooldownEnd(fleet);
  const mud = useMud();

  const coord = useMemo(() => {
    if (!fleet) return { x: 0, y: 0 };

    const fleetObj = game.STARMAP.objects.getFleet(fleet);

    if (!fleetObj) return { x: 0, y: 0 };

    return fleetObj.getPixelCoord();
  }, [fleet, game]);

  const disableAttack = useMemo(
    () => noUnits || selectingMoveDestination || stats.attack === 0n || !getCanAttackSomeone(fleet) || inCooldown,
    [noUnits, selectingMoveDestination, stats.attack, fleet, inCooldown]
  );

  const stance = components.FleetStance.use(fleet)?.stance;

  if (!mapOpen || !position) return <></>;

  return (
    <Marker
      id={"fleet-target"}
      scene={"STARMAP"}
      coord={coord}
      depth={DepthLayers.Path + 1}
      offScreenIconUri={InterfaceIcons.Outgoing}
    >
      <div className="w-14 h-14 border-2 border-error flex items-center justify-center bg-transparent">
        <div className="absolute top-0 right-0 translate-x-full w-36">
          <Button
            disabled={disableAttack}
            onClick={() =>
              selectingAttackDestination ? components.Attack.reset() : components.Attack.setOrigin(fleet)
            }
            className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
          >
            <IconLabel imageUri={InterfaceIcons.Crosshairs} text={selectingAttackDestination ? "Cancel" : "Attack"} />
          </Button>
        </div>
        {!!stance && (
          <div className="absolute bottom-0 right-0 translate-x-full w-36">
            <Button
              onClick={() => clearFleetStance(mud, fleet)}
              className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
            >
              <IconLabel imageUri={InterfaceIcons.Debug} text="Clear Stance" />
            </Button>
          </div>
        )}

        {!stance && (
          <div className="absolute bottom-0 right-0 translate-x-full w-36">
            <Button
              disabled={selectingAttackDestination || noUnits || spaceRockData.isBlocked}
              onClick={() => (selectingMoveDestination ? components.Send.reset() : components.Send.setOrigin(fleet))}
              className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
            >
              <IconLabel
                imageUri={InterfaceIcons.Debug}
                text={spaceRockData.isBlocked ? "Blocked" : selectingMoveDestination ? "Cancel" : "Move"}
              />
            </Button>
          </div>
        )}

        <div className="absolute top-0 left-0 -translate-x-full">
          <Modal>
            <Modal.Button
              onClick={() => components.ActiveRock.set({ value: position as Entity })}
              disabled={selectingAttackDestination || selectingMoveDestination}
              className="btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 pl-2 border-secondary/50 w-28 transition-[width] duration-200"
            >
              <IconLabel imageUri={InterfaceIcons.Settings} text={"MANAGE"} />
            </Modal.Button>
            <Modal.Content className="w-3/4 h-[800px]">
              <Fleets initialState="manageFleet" fleetEntity={fleet} />
            </Modal.Content>
          </Modal>
        </div>
      </div>
    </Marker>
  );
};

export const FleetTarget = () => {
  const activeFleet = components.SelectedFleet.use()?.value;
  const position = components.FleetMovement.use(activeFleet as Entity)?.destination;
  if (!activeFleet || !position) return <></>;
  return <_FleetTarget fleet={activeFleet as Entity} position={position as Entity} />;
};
