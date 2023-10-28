import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, HasValue } from "@latticexyz/recs";
import { ERock } from "contracts/config/enums";
import { FaCrosshairs } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { MotherlodeSizeNames } from "src/util/constants";
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

  return (
    <SecondaryCard className="w-full flex-row text-xs items-center justify-between gap-2">
      <img src={motherlodeInfo.imageUri} className="w-8 h-8" />
      <div className="flex items-center gap-4 flex-grow justify-between px-4">
        <LabeledValue label={`RESOURCE`}>
          <p>{getBlockTypeName(motherlodeInfo.motherlodeData.motherlodeResource)}</p>
        </LabeledValue>
        <LabeledValue label={`SIZE`}>
          <p>{MotherlodeSizeNames[motherlodeInfo.motherlodeData.size ?? 0]}</p>
        </LabeledValue>
        <LabeledValue label={`COORD`}>
          <p className=" whitespace-nowrap">
            [{motherlodeInfo.position.x}, {motherlodeInfo.position.y}]
          </p>
        </LabeledValue>
      </div>

      <Button
        className="btn-secondary btn-sm btn-square flex"
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

          pan({
            x: motherlodeInfo.position.x,
            y: motherlodeInfo.position.y,
          });

          zoomTo(2);
        }}
      >
        <FaCrosshairs />
      </Button>
    </SecondaryCard>
  );
};

export const OwnedMotherlodes: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;

  const query = [
    HasValue(components.OwnedBy, { value: playerEntity }),
    HasValue(components.RockType, { value: ERock.Motherlode }),
  ];

  const motherlodes = useEntityQuery(query);

  return (
    <>
      {motherlodes.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50">NO OWNED MOTHERLODES</p>
        </SecondaryCard>
      )}
      {motherlodes.map((entity) => {
        return <Motherlode key={entity} motherlodeId={entity} />;
      })}
    </>
  );
};
