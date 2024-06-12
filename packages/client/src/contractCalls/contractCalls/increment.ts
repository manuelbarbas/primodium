import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Core, getSystemId } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const createIncrement = ({ tables }: Core, { execute }: ExecuteFunctions) => {
  return async (withSession?: boolean) => {
    tables.CurrentTransaction.set({ value: true });
    await execute(
      {
        functionName: "Pri_11__increment",
        systemId: getSystemId("IncrementSystem"),
        withSession,
        args: [],
      },
      {
        id: defaultEntity,
      }
    );

    tables.CurrentTransaction.set({ value: false });
    return tables.Counter.get()?.value;
  };
};
