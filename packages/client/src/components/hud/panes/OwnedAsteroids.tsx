import { Scenes } from "@game/constants";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getSpaceRockInfo } from "src/util/spacerock";

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

const Asteroid: React.FC<{ asteroid: Entity }> = ({ asteroid }) => {
  const primodium = usePrimodium();
  const asteroidInfo = getSpaceRockInfo(primodium, asteroid);

  return (
    <Button
      className="row-span-1 flex text-xs bg-base-100 p-2 flex-nowrap border-secondary"
      onClick={async () => {
        const mapOpen = components.MapOpen.get(undefined, {
          value: false,
        }).value;

        if (!mapOpen) {
          const { transitionToScene } = primodium.api().scene;

          await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
          components.MapOpen.set({ value: true });
        }

        const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

        components.Send.setDestination(asteroidInfo.entity);
        components.SelectedRock.set({ value: asteroidInfo.entity });

        pan({
          x: asteroidInfo.position.x,
          y: asteroidInfo.position.y,
        });

        zoomTo(2);
      }}
    >
      <img src={asteroidInfo.imageUri} className=" w-9 h-9 bg-neutral" />
      <div className="flex flex-col h-fit text-xs gap-1">
        <div className="flex gap-1 items-center justify-center"></div>
        <p className="whitespace-nowrap font-medium text-white/50">
          [{asteroidInfo.position.x},{asteroidInfo.position.y}]
        </p>
      </div>
    </Button>
  );
};

export const OwnedAsteroids: React.FC = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const asteroids = useEntityQuery(query);

  return (
    <>
      {asteroids.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50 uppercase">you control no MOTHERLODES</p>
        </SecondaryCard>
      )}
      <div className="grid grid-cols-2 gap-1">
        {asteroids.map((entity) => {
          return <Asteroid key={entity} asteroid={entity} />;
        })}
      </div>
    </>
  );
};
