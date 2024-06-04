import { useContext } from "react";
import { MudContext } from "./providers/MudProvider";

export const useMud = () => {
  const value = useContext(MudContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
