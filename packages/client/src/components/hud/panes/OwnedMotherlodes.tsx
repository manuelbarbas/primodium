import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, HasValue } from "@latticexyz/recs";
import { ERock, ESize } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage } from "src/util/constants";
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

const Motherlode: React.FC<{ motherlodeId: Entity }> = ({ motherlodeId }) => {
  const motherlodeInfo = getSpaceRockInfo(motherlodeId);
  const resource = motherlodeInfo.motherlodeData.motherlodeResource;
  const size = motherlodeInfo.motherlodeData.size;
  const sizeName = size === ESize.Small ? "sm" : size === ESize.Medium ? "md" : "lg";

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

        components.Send.setDestination(motherlodeInfo.entity);
        components.SelectedRock.set({ value: motherlodeInfo.entity });

        pan({
          x: motherlodeInfo.position.x,
          y: motherlodeInfo.position.y,
        });

        zoomTo(2);
      }}
    >
      <img src={motherlodeInfo.imageUri} className=" w-9 h-9 bg-neutral" />
      <div className="flex flex-col h-fit text-xs gap-1">
        <div className="flex gap-1 items-center justify-center">
          <p>{sizeName}</p>
          <IconLabel imageUri={ResourceImage.get(resource) ?? ""} tooltipText={getBlockTypeName(resource)} />
        </div>
        <p className="whitespace-nowrap font-medium text-white/50">
          [{motherlodeInfo.position.x},{motherlodeInfo.position.y}]
        </p>
      </div>
    </Button>
  );
};

export const OwnedMotherlodes: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;

  const query = [
    HasValue(components.OwnedBy, { value: playerEntity }),
    HasValue(components.RockType, { value: ERock.Motherlode }),
  ];

  const motherlodes = useEntityQuery(query).sort((a, b) => {
    const aMotherlode = getSpaceRockInfo(a);
    const bMotherlode = getSpaceRockInfo(b);
    return (bMotherlode.motherlodeData.size ?? 0) - (aMotherlode.motherlodeData.size ?? 0);
  });

  return (
    <>
      {motherlodes.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50 uppercase">you control no MOTHERLODES</p>
        </SecondaryCard>
      )}
      <div className="grid grid-cols-3 gap-1">
        {motherlodes.map((entity) => {
          return <Motherlode key={entity} motherlodeId={entity} />;
        })}
      </div>
    </>
  );
};
