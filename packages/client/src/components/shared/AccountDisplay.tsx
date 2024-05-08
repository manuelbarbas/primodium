import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { useGame } from "src/hooks/useGame";
import { components } from "src/network/components";
import { getRockRelationship } from "src/util/asteroid";
import { entityToColor } from "src/util/color";
import { Mode, RockRelationshipColors } from "src/util/constants";
import { Modal } from "../core/Modal";

export const AccountDisplay: React.FC<{
  player: Entity | undefined;
  className?: string;
  noColor?: boolean;
  showAddress?: boolean;
  raw?: boolean;
}> = ({ player, className, noColor, showAddress, raw = false }) => {
  const game = useGame();
  const { playerAccount } = useMud();
  const playerEntity = player ?? singletonEntity;

  const myHomeAsteroid = components.Home.use(playerAccount.entity)?.value;
  const playerHomeAsteroid = components.Home.use(playerEntity)?.value;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity, showAddress);
  const playerColor = RockRelationshipColors[getRockRelationship(playerEntity, myHomeAsteroid as Entity)];

  const Content = ({ className = "" }: { className?: string }) => (
    <div className={`w-full flex gap-2 ${className}`}>
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

  if (raw) return <Content className={className} />;

  return (
    <Modal.CloseButton
      variant="ghost"
      size="xs"
      onClick={() => {
        if (!playerHomeAsteroid) return;

        const playerHomeAsteroidPosition = components.Position.get(playerHomeAsteroid as Entity);

        if (!playerHomeAsteroidPosition) return;

        if (components.SelectedMode.get()?.value !== Mode.Starmap) {
          components.SelectedMode.set({ value: Mode.Starmap });
        }

        components.SelectedRock.set({ value: playerHomeAsteroid as Entity });
        game.STARMAP.camera.pan({ x: playerHomeAsteroidPosition.x, y: playerHomeAsteroidPosition.y });
      }}
      className={`p-0 uppercase inline-flex font-bold gap-1 ${className} ${loading ? "animate-pulse" : ""}`}
    >
      <Content />
    </Modal.CloseButton>
  );
};
