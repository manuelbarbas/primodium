import { memo, useEffect } from "react";
import createGame from "../game/createGame";
import { useMud } from "../context/MudContext";
import { useGameStore } from "../store/GameStore";
import GameUI from "../components/GameUi";

export const Game = memo(() => {
  const { world } = useMud();
  const [setGame] = useGameStore((state) => [state.setGame]);

  useEffect(() => {
    createGame(world).then((game) => setGame(game));
  }, []);

  return (
    <>
      <div id="phaser-container" />;
      <GameUI />
    </>
  );
});
