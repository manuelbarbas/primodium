import { ReactNode, createContext, useContext } from "react";

import { Network } from "src/network/layer";

export const MudContext = createContext<Network | null>(null);

type Props = Network & {
  children: ReactNode;
};

export const MudProvider = ({ children, ...value }: Props) => {
  const currentValue = useContext(MudContext);
  if (currentValue) throw new Error("MudProvider can only be used once");

  return <MudContext.Provider value={value}>{children}</MudContext.Provider>;
};

export const useMud = () => {
  const value = useContext(MudContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
