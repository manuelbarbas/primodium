import { Entity, defaultEntity } from "@primodiumxyz/reactive-tables";
import { Mode, RockRelationshipColors } from "@primodiumxyz/core";
import { useCore, useAccountClient, usePlayerName } from "@primodiumxyz/core/react";
import { useGame } from "@/hooks/useGame";
import { Modal } from "../core/Modal";

export const AccountDisplay: React.FC<{
  player: Entity | undefined;
  className?: string;
  noColor?: boolean;
  overridePlayerColor?: string;
  showAddress?: boolean;
  showAlliance?: boolean;
  raw?: boolean;
}> = ({ player, className, noColor, overridePlayerColor, showAddress, showAlliance = true, raw = false }) => {
  const game = useGame();
  const { playerAccount } = useAccountClient();
  const { tables, utils } = useCore();
  const playerEntity = player ?? defaultEntity;

  const myHomeAsteroid = tables.Home.use(playerAccount.entity)?.value;
  const playerHomeAsteroid = tables.Home.use(playerEntity)?.value;
  const { allianceName, loading, address, linkedAddress } = usePlayerName(playerEntity, showAddress);
  const playerColor =
    overridePlayerColor ?? RockRelationshipColors[utils.getRockRelationship(playerEntity, myHomeAsteroid as Entity)];

  const Content = ({ className = "" }: { className?: string }) => (
    <div className={`w-full flex gap-2 ${className}`}>
      {allianceName && showAlliance && (
        <div className="font-bold text-accent" style={{ color: noColor ? "auto" : utils.getEntityColor(player) }}>
          [{allianceName.toUpperCase()}]
        </div>
      )}
      <p className={`grow truncate ${noColor ? "text-white" : `text-${playerColor}`}`}>
        {linkedAddress?.ensName ?? address}
      </p>
    </div>
  );

  const handleClick = () => {
    if (!playerHomeAsteroid) return;

    const playerHomeAsteroidPosition = tables.Position.get(playerHomeAsteroid as Entity);

    if (!playerHomeAsteroidPosition) return;

    if (tables.SelectedMode.get()?.value !== Mode.Starmap) {
      tables.SelectedMode.set({ value: Mode.Starmap });
    }

    tables.SelectedRock.set({ value: playerHomeAsteroid as Entity });
    game.STARMAP.camera.pan({ x: playerHomeAsteroidPosition.x, y: playerHomeAsteroidPosition.y });
  };

  if (raw) return <Content className={className} />;

  return (
    <Modal.CloseButton
      variant="ghost"
      size="xs"
      onClick={handleClick}
      className={`p-0 uppercase inline-flex font-bold gap-1 ${className} ${loading ? "animate-pulse" : ""}`}
    >
      <Content />
    </Modal.CloseButton>
  );
};
