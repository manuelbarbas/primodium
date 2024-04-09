import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getAsteroidImage, getAsteroidInfo, getAsteroidName } from "src/util/asteroid";
import { getRandomRange } from "src/util/common";
import { EntityType, ResourceImage } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { HealthBar } from "../HealthBar";
import { formatResourceCount } from "src/util/number";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { Badge } from "src/components/core/Badge";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1 w-fit">
      <p className="text-xs font-bold text-accent">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const OwnedAsteroid: React.FC<{ asteroid: Entity; onClick?: () => void }> = ({ asteroid, onClick }) => {
  const {
    components,
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const imageUri = getAsteroidImage(primodium, asteroid);
  const description = getAsteroidName(asteroid);
  const home = components.Home.use(playerEntity)?.value === asteroid;
  const active = components.ActiveRock.use()?.value === asteroid;
  const selected = components.SelectedRock.use()?.value === asteroid;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    asteroid
  );
  const { strength, maxStrength } = useAsteroidStrength(asteroid);

  return (
    <Button
      className={`row-span-1 flex flex-col p-2 items-center text-xs bg-base-100 flex-nowrap border-secondary h-full ${
        selected ? "ring-2 ring-warning" : ""
      }`}
      onClick={async () => {
        onClick && onClick();
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <img src={imageUri} className=" w-12 h-12 p-2 bg-neutral border border-secondary" />
        <div className="flex flex-col h-fit text-xs gap-1">
          <div className="flex gap-1 items-center justify-center"></div>
          <p className="font-bold -mt-3 bg-secondary">{entityToRockName(asteroid)}</p>
          <p className="w-26 text-center wrap font-thin">{description}</p>
        </div>
      </div>
      <hr className="w-full border border-secondary/25" />
      {home && <div className="absolute top-0 left-0 px-1 bg-info text-[.6rem]">home</div>}
      {active && <div className="absolute top-0 right-0 px-1 bg-neutral text-[.6rem]">active</div>}

      <Badge className="w-full text-xs text-accent bg-base-100 p-1 border border-secondary">
        <HealthBar
          tooltipText="Encryption"
          imgUrl={ResourceImage.get(EntityType.Encryption) ?? ""}
          health={Number(formatResourceCount(EntityType.Encryption, encryption, { notLocale: true }))}
          maxHealth={Number(formatResourceCount(EntityType.Encryption, maxEncryption, { notLocale: true }))}
        />
      </Badge>
      <Badge className="w-full text-xs text-accent bg-base-100 p-1 border border-secondary">
        <HealthBar
          tooltipText="Strength"
          imgUrl={ResourceImage.get(EntityType.HP) ?? ""}
          health={Number(formatResourceCount(EntityType.HP, strength, { notLocale: true, showZero: true }))}
          maxHealth={Number(formatResourceCount(EntityType.HP, maxStrength, { notLocale: true, showZero: true }))}
        />
      </Badge>
    </Button>
  );
};

export const _OwnedAsteroids: React.FC = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const primodium = usePrimodium();
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const asteroids = useEntityQuery(query);

  return (
    <div className="p-2 max-h-96 overflow-y-auto scrollbar w-96">
      {asteroids.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50 uppercase">you control no asteroids</p>
        </SecondaryCard>
      )}
      <div className="grid grid-cols-2 gap-1">
        {asteroids.map((entity) => {
          return (
            <OwnedAsteroid
              key={entity}
              asteroid={entity}
              onClick={async () => {
                const { position } = getAsteroidInfo(primodium, entity);
                const mapOpen = components.MapOpen.get(undefined, {
                  value: false,
                }).value;

                if (!mapOpen) {
                  const { transitionToScene } = primodium.api().scene;

                  await transitionToScene("ASTEROID", "STARMAP");
                  components.MapOpen.set({ value: true });
                }

                const { pan, zoomTo } = primodium.api("STARMAP").camera;

                components.SelectedRock.set({ value: entity });

                pan({
                  x: position.x,
                  y: position.y,
                });

                zoomTo(2);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const OwnedAsteroids = () => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <Widget
      id="owned_asteroids"
      title="Owned Asteroids"
      icon="/img/icons/asteroidicon.png"
      defaultCoord={{
        x: window.innerWidth / 2 + getRandomRange(-50, 50),
        y: window.innerHeight / 2 + getRandomRange(-50, 50),
      }}
      defaultLocked
      defaultVisible
      persist
      lockable
      draggable
      scene={"ASTEROID"}
      active={!!mapOpen}
    >
      <_OwnedAsteroids />
    </Widget>
  );
};
