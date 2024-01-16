import { singletonEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";

export const increment = async (mud: MUD, delegate?: boolean) => {
  components.CurrentTransaction.set({ value: true });
  await execute(
    {
      mud,
      functionName: "increment",
      systemId: getSystemId("IncrementSystem"),
      delegate,
    },
    {
      id: singletonEntity,
    }
  );

  components.CurrentTransaction.set({ value: false });
  return components.Counter.get();
};
