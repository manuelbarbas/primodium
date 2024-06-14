import { Core, ExecuteFunctions } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const createIncrement = ({ tables }: Core, { execute }: ExecuteFunctions) => {
  return async (withSession?: boolean) => {
    tables.CurrentTransaction.set({ value: true });
    await execute({
      functionName: "Pri_11__increment",
      withSession,
      args: [],
      txQueueOptions: {
        id: defaultEntity,
      },
    });

    tables.CurrentTransaction.set({ value: false });
    return tables.Counter.get()?.value;
  };
};
