import { singletonEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";

export const increment = async (mud: MUD, delegate?: boolean) => {
  components.CurrentTransaction.set({ value: true });
  await execute(mud, (account) => account.worldContract.write.increment(), {
    id: singletonEntity,
    delegate: delegate ?? false,
  });

  components.CurrentTransaction.set({ value: false });
  return components.Counter.get();
};
