import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { FaEye } from "react-icons/fa";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { components } from "src/network/components";
import { entityToColor } from "src/util/color";
import { Button } from "../core/Button";

export const AccountDisplay: React.FC<{
  player?: Entity;
  className?: string;
  showSpectate?: boolean;
  noColor?: boolean;
}> = ({ player, className, noColor, showSpectate = false }) => {
  const { network } = useMud();
  const playerEntity = player ?? network.playerEntity;
  const homeAsteroid = components.Home.use(playerEntity)?.asteroid;
  const { transitionToScene } = primodium.api().scene;
  const { allianceName, loading, address, linkedAddress } = useAccount(playerEntity);

  return (
    <Button
      className={`btn-xs btn-ghost p-0 inline-flex flex gap-1 ${className} ${loading ? "animate-pulse" : ""}`}
      style={{ color: noColor ? "auto" : entityToColor(player) }}
      onClick={async () => {
        components.ActiveRock.set({ value: homeAsteroid as Entity });
        components.SelectedRock.set({ value: homeAsteroid as Entity });
        await transitionToScene(Scenes.Starmap, Scenes.Asteroid, 0);
        components.MapOpen.set({ value: false });
      }}
    >
      {showSpectate && <FaEye />}
      {allianceName && <span className="font-bold text-accent">[{allianceName.toUpperCase()}]</span>}
      {linkedAddress?.ensName ?? address}
    </Button>
  );
};
