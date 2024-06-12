import { ampli } from "src/ampli";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { parseReceipt } from "@/util/analytics/parseReceipt";
import { getSystemId } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const createSpawn = ({ execute }: ExecuteFunctions) => {
  return async () =>
    await execute(
      {
        systemId: getSystemId("SpawnSystem"),
        functionName: "Pri_11__spawn",
        withSession: true,
        args: [],
      },
      { id: defaultEntity },
      (receipt) => {
        ampli.systemSpawn({
          ...parseReceipt(receipt),
        });
      }
    );
};
