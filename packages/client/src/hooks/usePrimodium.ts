import { useContext } from "react";
import { PrimodiumContext } from "./providers/PrimodiumProvider";

export const usePrimodium = () => {
  const context = useContext(PrimodiumContext);
  if (!context) {
    throw new Error("usePrimodium must be used within a PrimodiumProvider");
  }
  return context;
};
