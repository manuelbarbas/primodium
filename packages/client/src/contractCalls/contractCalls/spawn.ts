import { ampli } from "src/ampli";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { getSystemId } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

import { parseReceipt } from "@/contractCalls/parseReceipt";

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
