import { useContext } from "react";
import { CoreContext } from "@/hooks/providers/CoreProvider";

/**
 * Provides access to the CoreContext.
 * Throws an error if used outside of a MUDProvider.
 * @returns The value from the CoreContext.
 * @throws {Error} If used outside of a MUDProvider.
 */
export const useCore = () => {
  const value = useContext(CoreContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
