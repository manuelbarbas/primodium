import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { FaCrosshairs } from "react-icons/fa";
import {
  Account,
  MapOpen,
  Send,
} from "src/network/components/clientComponents";
import { ESpaceRockType } from "src/util/web3/types";
import { AsteroidType, OwnedBy } from "src/network/components/chainComponents";
import { primodium } from "@game/api";
import { SingletonID } from "@latticexyz/network";
import { useEntityQuery } from "@latticexyz/react";
import { SecondaryCard } from "src/components/core/Card";
import { world } from "src/network/world";
import { getSpaceRockInfo } from "src/util/spacerock";
import { Button } from "src/components/core/Button";
import { getBlockTypeName } from "src/util/common";
import { MotherlodeSizeNames } from "src/util/constants";
import { Scenes } from "@game/constants";

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

const Motherlode: React.FC<{ motherlodeId: EntityID }> = ({ motherlodeId }) => {
  const motherlodeInfo = getSpaceRockInfo(motherlodeId);

  return (
    <SecondaryCard className="w-full flex-row text-xs items-center justify-between gap-2">
      <img src={motherlodeInfo.imageUri} className="w-8 h-8" />
      <div className="flex items-center gap-4 flex-grow justify-between px-4">
        <LabeledValue label={`RESOURCE`}>
          <p>{getBlockTypeName(motherlodeInfo.motherlodeData.resource)}</p>
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
          const mapOpen = MapOpen.get(undefined, {
            value: false,
          }).value;

          if (!mapOpen) {
            const { transitionToScene } = primodium.api().scene;

            await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
            MapOpen.set({ value: true });
          }

          const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

          Send.setDestination(motherlodeInfo.position);

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
  const player = Account.use(undefined, {
    value: SingletonID,
  }).value;

  const query = [
    Has(AsteroidType),
    HasValue(OwnedBy, { value: player }),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const motherlodes = useEntityQuery(query);

  return (
    <>
      {motherlodes.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50">NO OWNED MOTHERLODES</p>
        </SecondaryCard>
      )}
      {motherlodes.map((entityIndex) => {
        const entityId = world.entities[entityIndex];

        return <Motherlode key={entityId} motherlodeId={entityId} />;
      })}
    </>
  );
};
