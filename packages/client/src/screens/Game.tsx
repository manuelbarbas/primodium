import { memo, useEffect } from "react";
import createGame from "../game/createGame";
import { useMud } from "../context/MudContext";
import GameUI from "../components/GameUI";

export const Game = memo(() => {
  const { world } = useMud();

  useEffect(() => {
    createGame(world);
  }, []);

  return (
    <>
      <div id="phaser-container" />
      <GameUI />
    </>
  );
});
