import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";

export const increment = async (mud: MUD, withSession?: boolean) => {
  components.CurrentTransaction.set({ value: true });
  await execute(
    {
      mud,
      functionName: "Pri_11__increment",
      systemId: getSystemId("IncrementSystem"),
      withSession,
    },
    {
      id: singletonEntity,
    }
  );

  components.CurrentTransaction.set({ value: false });
  return components.Counter.get();
};
