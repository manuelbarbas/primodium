import { Entity } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { entityToColor } from "src/util/color";

export const AccountDisplay: React.FC<{ player?: Entity; className?: string; noColor?: boolean }> = ({
  player,
  className,
  noColor,
}) => {
  const { network } = useMud();
  const playerEntity = player ?? network.playerEntity;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity);

  return (
    <p
      className={`inline-flex flex gap-1 ${className} ${loading ? "animate-pulse" : ""}`}
      style={{ color: noColor ? "auto" : entityToColor(player) }}
    >
      {allianceName && <span className="font-bold text-accent">[{allianceName.toUpperCase()}]</span>}
      {linkedAddress?.ensName ?? address}
    </p>
  );
};
