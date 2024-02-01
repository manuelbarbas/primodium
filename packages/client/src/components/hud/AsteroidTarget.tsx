import { Entity } from "@latticexyz/recs";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "../core/Button";
import { IconLabel } from "../core/IconLabel";
import { Scenes } from "@game/constants";
import { Marker } from "../shared/Marker";
import { GracePeriod } from "./GracePeriod";
import { getAsteroidImage } from "src/util/asteroid";
import { useMud } from "src/hooks";

export const _AsteroidTarget: React.FC<{ selectedAsteroid: Entity }> = ({ selectedAsteroid }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const {
    hooks: { useCoordToScreenCoord, useCamera },
    scene: { transitionToScene, getConfig },
  } = primodium.api(Scenes.Starmap);
  const ownedBy = components.OwnedBy.use(selectedAsteroid as Entity)?.value;
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const position = components.Position.use(selectedAsteroid as Entity) ?? { x: 0, y: 0 };
  const imageUri = getAsteroidImage(primodium, selectedAsteroid as Entity);
  const { screenCoord, isBounded } = useCoordToScreenCoord(position, true);
  const { zoom } = useCamera();
  const {
    camera: { defaultZoom, minZoom, maxZoom },
  } = getConfig(Scenes.Starmap);

  if (!mapOpen) return <></>;

  if (isBounded) return <Marker coord={position} imageUri="/img/icons/weaponryicon.png" />;

  return (
    <div
      style={{ left: `calc(${screenCoord.x}px)`, top: `calc(${screenCoord.y}px)` }}
      className={`text-error absolute -translate-y-1/2 -translate-x-1/2`}
    >
      <div
        className="w-14 h-14 border-2 border-error flex items-center justify-center transition-all bg-neutral"
        style={{
          width: `${Math.min(125, Math.max(60, (zoom / maxZoom) * 125))}px`,
          height: `${Math.min(125, Math.max(60, (zoom / maxZoom) * 125))}px`,
          background: `rgba(0,0,0, ${zoom <= minZoom ? 100 : 1 - zoom / defaultZoom}%`,
        }}
      >
        <div className="absolute top-0 right-0 translate-x-full w-24">
          <Button
            className="btn-ghost btn-xs text-xs text-accent bg-slate-900 border border-l-0 border-secondary/50"
            onClick={async () => {
              components.ActiveRock.set({ value: selectedAsteroid });
              await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
              components.MapOpen.set({ value: false });
            }}
          >
            {playerEntity !== ownedBy && (
              <IconLabel imageUri="/img/icons/spectateicon.png" className={``} text="VIEW" />
            )}
            {playerEntity === ownedBy && <IconLabel imageUri="/img/icons/minersicon.png" className={``} text="BUILD" />}
          </Button>
        </div>
        <div className="absolute bottom-0 right-0 translate-x-full w-36">
          <Button className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50">
            <IconLabel imageUri="/img/icons/weaponryicon.png" className={``} text="SEND FLEET" />
          </Button>
        </div>
        {ownedBy && (
          <div className="absolute top-0 left-0 -translate-x-full">
            <Button className="btn-ghost btn-xs text-xs text-accent bg-emerald-900 border border-r-0 border-secondary/50 w-36">
              <GracePeriod player={ownedBy as Entity} />
            </Button>
          </div>
        )}
        <div className="absolute bottom-0 left-0 -translate-x-full">
          <Button
            className="btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 border-secondary/50 w-28"
            onClick={() => components.SelectedRock.remove()}
          >
            <IconLabel imageUri="/img/icons/returnicon.png" className={``} text="CLOSE" />
          </Button>
        </div>
        <img
          src={imageUri}
          className="scale-75"
          style={{ opacity: `${zoom <= minZoom ? 100 : (1 - zoom / defaultZoom) * 100}%` }}
        />
      </div>
    </div>
  );
};

export const AsteroidTarget = () => {
  const selectedAsteroid = components.SelectedRock.use()?.value;
  if (!selectedAsteroid) return <></>;
  return <_AsteroidTarget selectedAsteroid={selectedAsteroid} />;
};
