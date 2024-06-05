import { useContext } from "react";
import { CoreContext } from "@/hooks/providers/CoreProvider";

export const useCore = () => {
  const value = useContext(CoreContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
