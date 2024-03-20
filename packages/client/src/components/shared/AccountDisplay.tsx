import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { components } from "src/network/components";
import { entityToColor } from "src/util/color";
import { RockRelationshipColors } from "src/util/constants";
import { getRockRelationship } from "src/util/asteroid";
import { usePrimodium } from "src/hooks/usePrimodium";
import { Scenes } from "src/game/lib/mappings";
import { Modal } from "../core/Modal";
import { useMemo } from "react";

export const AccountDisplay: React.FC<{
  player: Entity | undefined;
  className?: string;
  noColor?: boolean;
  showAddress?: boolean;
  raw?: boolean;
}> = ({ player, className, noColor, showAddress, raw = false }) => {
  const primodium = usePrimodium();
  const { playerAccount } = useMud();
  const playerEntity = player ?? singletonEntity;

  const myHomeAsteroid = components.Home.use(playerAccount.entity)?.value;
  const playerHomeAsteroid = components.Home.use(playerEntity)?.value;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity, showAddress);
  const playerColor = RockRelationshipColors[getRockRelationship(playerEntity, myHomeAsteroid as Entity)];

  const Content = useMemo(() => {
    return () => (
      <div className="w-full flex">
        {allianceName && (
          <div className="font-bold text-accent" style={{ color: noColor ? "auto" : entityToColor(player) }}>
            [{allianceName.toUpperCase()}]
          </div>
        )}
        <p className={`grow truncate ${noColor ? "text-white" : `text-${playerColor}`}`}>
          {linkedAddress?.ensName ?? address}
        </p>
      </div>
    );
  }, [allianceName, noColor, player, playerColor, linkedAddress?.ensName, address]);

  if (raw) return <Content />;

  return (
    <Modal.CloseButton
      onClick={() => {
        if (!playerHomeAsteroid) return;

        const playerHomeAsteroidPosition = components.Position.get(playerHomeAsteroid as Entity);

        if (!playerHomeAsteroidPosition) return;

        if (!components.MapOpen.get()?.value) {
          primodium.api(Scenes.Starmap).util.openMap();
        }

        primodium.api(Scenes.Starmap).camera.pan({ x: playerHomeAsteroidPosition.x, y: playerHomeAsteroidPosition.y });
      }}
      className={`btn-xs btn-ghost p-0 uppercase inline-flex font-bold gap-1 ${className} ${
        loading ? "animate-pulse" : ""
      }`}
    >
      <Content />
    </Modal.CloseButton>
  );
};
