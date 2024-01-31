import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useOrbitingFleets } from "src/hooks/useOrbitingFleets";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getAsteroidImage } from "src/util/asteroid";
import { Button } from "../core/Button";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Marker } from "../shared/Marker";
import { GracePeriod } from "./GracePeriod";
import { SelectFleet } from "./panes/fleets/SelectFleet";

export const _AsteroidTarget: React.FC<{ selectedAsteroid: Entity }> = ({ selectedAsteroid }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const {
    hooks: { useCoordToScreenCoord },
    scene: { transitionToScene },
  } = primodium.api(Scenes.Starmap);
  const ownedBy = components.OwnedBy.use(selectedAsteroid as Entity)?.value;
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const position = components.Position.use(selectedAsteroid as Entity) ?? { x: 0, y: 0 };
  const imageUri = getAsteroidImage(primodium, selectedAsteroid as Entity);
  const { screenCoord, isBounded } = useCoordToScreenCoord(position, true);
  const selectingDestination = !!components.Send.use()?.fleetEntity;
  const { inGracePeriod } = useInGracePeriod((ownedBy as Entity) ?? singletonEntity);
  const canSendFleet = useOrbitingFleets(selectedAsteroid).length > 0;

  if (!mapOpen) return <></>;

  if (isBounded) return <Marker coord={position} imageUri="/img/icons/weaponryicon.png" />;

  return (
    <div
      style={{ left: `calc(${screenCoord.x}px)`, top: `calc(${screenCoord.y}px)` }}
      className={`text-error absolute -translate-y-1/2 -translate-x-1/2`}
    >
      <div className="w-14 h-14 border-2 border-error flex items-center justify-center bg-neutral/75">
        <div className="absolute top-0 right-0 translate-x-full w-24">
          <Button
            className="btn-ghost btn-xs text-xs text-accent bg-slate-900 border border-l-0 border-secondary/50"
            onClick={async () => {
              components.ActiveRock.set({ value: selectedAsteroid });
              await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
              components.MapOpen.set({ value: false });
            }}
            disabled={selectingDestination}
          >
            {playerEntity !== ownedBy && (
              <IconLabel imageUri="/img/icons/spectateicon.png" className={``} text="VIEW" />
            )}
            {playerEntity === ownedBy && <IconLabel imageUri="/img/icons/minersicon.png" className={``} text="BUILD" />}
          </Button>
        </div>
        {ownedBy && (
          <>
            <div className="absolute bottom-0 right-0 translate-x-full w-36">
              <Modal title="Select a Fleet to Move">
                <Modal.Button
                  disabled={selectingDestination || !canSendFleet}
                  onClick={() => components.Send.setOrigin(selectedAsteroid)}
                  className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
                >
                  <IconLabel imageUri="/img/icons/weaponryicon.png" className={``} text="SEND FLEET" />
                </Modal.Button>
                <Modal.Content className="h-[30rem] w-[60rem]">
                  <SelectFleet />
                </Modal.Content>
              </Modal>
            </div>

            {inGracePeriod && (
              <div className="absolute top-0 left-0 -translate-x-full">
                <Button className="btn-ghost btn-xs text-xs text-accent bg-emerald-900 border border-r-0 border-secondary/50 w-36">
                  <GracePeriod player={ownedBy as Entity} />
                </Button>
              </div>
            )}
          </>
        )}
        <div className="absolute bottom-0 left-0 -translate-x-full">
          <Button
            className={`btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 pl-2 border-secondary/50 ${
              selectingDestination ? "w-32" : "w-28"
            } transition-[width] duration-200`}
            onClick={() => {
              components.Send.clear();
              !selectingDestination && components.SelectedRock.remove();
            }}
          >
            <IconLabel
              imageUri="/img/icons/returnicon.png"
              className={``}
              text={selectingDestination ? "CANCEL MOVE" : "CLOSE"}
            />
          </Button>
        </div>
        <img src={imageUri} className="scale-75" />
      </div>
    </div>
  );
};

export const AsteroidTarget = () => {
  const selectedAsteroid = components.SelectedRock.use()?.value;
  if (!selectedAsteroid) return <></>;
  return <_AsteroidTarget selectedAsteroid={selectedAsteroid} />;
};
