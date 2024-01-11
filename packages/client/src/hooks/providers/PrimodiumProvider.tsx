import { Primodium } from "@game/api";
import { ReactNode, createContext } from "react";

// Create a context
export const PrimodiumContext = createContext<Primodium | null>(null);

type Props = Primodium & {
  children: ReactNode;
};

export const PrimodiumProvider = ({ children, ...primodium }: Props) => {
  return <PrimodiumContext.Provider value={primodium}>{children}</PrimodiumContext.Provider>;
};
