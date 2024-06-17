import { PrimodiumGame } from "@primodiumxyz/game";
import { ReactNode, createContext } from "react";

// Create a context
export const GameContext = createContext<PrimodiumGame | null>(null);

type Props = PrimodiumGame & {
  children: ReactNode;
};

export const GameProvider = ({ children, ...game }: Props) => {
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
};
