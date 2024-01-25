import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { components } from "src/network/components";
import { entityToColor } from "src/util/color";
import { RockRelationshipColors } from "src/util/constants";
import { getRockRelationship } from "src/util/spacerock";

export const AccountDisplay: React.FC<{
  player: Entity | undefined;
  className?: string;
  noColor?: boolean;
  showAddress?: boolean;
}> = ({ player, className, noColor, showAddress }) => {
  const { playerAccount } = useMud();
  const playerEntity = player ?? singletonEntity;

  const myHomeAsteroid = components.Home.use(playerAccount.entity)?.value;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity, showAddress);
  const playerColor = RockRelationshipColors[getRockRelationship(playerEntity, myHomeAsteroid as Entity)];

  return (
    <div className={`uppercase inline-flex font-bold gap-1 ${className} ${loading ? "animate-pulse" : ""}`}>
      {allianceName && (
        <span className="font-bold text-accent" style={{ color: noColor ? "auto" : entityToColor(player) }}>
          [{allianceName.toUpperCase()}]
        </span>
      )}
      <p className={`text-${noColor ? "white" : playerColor}`}>{linkedAddress?.ensName ?? address}</p>
    </div>
  );
};
