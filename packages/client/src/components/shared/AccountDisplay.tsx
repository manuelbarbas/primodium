import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { FaEye } from "react-icons/fa";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { entityToColor } from "src/util/color";
import { RockRelationshipColors } from "src/util/constants";
import { getRockRelationship } from "src/util/spacerock";
import { Button } from "../core/Button";

export const AccountDisplay: React.FC<{
  player?: Entity;
  className?: string;
  showSpectate?: boolean;
  noColor?: boolean;
  disabled?: boolean;
  showAddress?: boolean;
}> = ({ player, className, noColor, showSpectate = false, disabled, showAddress }) => {
  const { playerAccount } = useMud();
  const playerEntity = player ?? playerAccount.entity;

  const homeAsteroid = components.Home.use(playerEntity)?.asteroid;
  const myHomeAsteroid = components.Home.use(playerAccount.entity)?.asteroid;
  const primodium = usePrimodium();
  const { transitionToScene } = primodium.api().scene;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity, showAddress);
  const playerColor = RockRelationshipColors[getRockRelationship(playerEntity, myHomeAsteroid as Entity)];

  return (
    <Button
      className={`btn-xs btn-ghost p-0 inline-flex flex font-bold gap-1 ${className} ${loading ? "animate-pulse" : ""}`}
      disabled={disabled}
      onClick={async () => {
        components.ActiveRock.set({ value: homeAsteroid as Entity });
        components.SelectedRock.set({ value: homeAsteroid as Entity });
        await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
        components.MapOpen.set({ value: false });
      }}
    >
      {showSpectate && <FaEye />}
      {allianceName && (
        <span className="font-bold text-accent" style={{ color: noColor ? "auto" : entityToColor(player) }}>
          [{allianceName.toUpperCase()}]
        </span>
      )}
      <p className={`text-${noColor ? "white" : playerColor}`}>{linkedAddress?.ensName ?? address}</p>
    </Button>
  );
};
