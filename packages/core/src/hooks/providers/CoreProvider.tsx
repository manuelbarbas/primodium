import React, { ReactNode, createContext } from "react";
import { Core } from "@/lib/types";

export const CoreContext = createContext<Core | null>(null);

type Props = Core & {
  children: ReactNode;
};

export const CoreProvider = ({ children, ...value }: Props) => {
  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
};
