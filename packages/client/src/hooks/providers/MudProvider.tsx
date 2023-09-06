import { ReactNode, createContext, useContext } from "react";
import { SetupResult } from "src/network/types";

export const MudContext = createContext<SetupResult | null>(null);

type Props = SetupResult & {
  children: ReactNode;
};

export const MudProvider = ({ children, ...value }: Props) => {
  const currentValue = useContext(MudContext);
  if (currentValue) throw new Error("MudProvider can only be used once");

  return <MudContext.Provider value={value}>{children}</MudContext.Provider>;
};
