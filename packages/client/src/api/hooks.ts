import { useGameStore } from "../store/GameStore";

/**
 * A React hook that returns the current status of the game.
 * @returns {GameStatus} The current status of the game.
 */
export const useStatus = () => {
  return useGameStore((state) => {
    return state.status;
  });
};
