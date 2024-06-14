import { ampli } from "src/ampli";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

import { parseReceipt } from "@/contractCalls/parseReceipt";
import { ExecuteFunctions } from "@primodiumxyz/core";

export const createSpawn = ({ execute }: ExecuteFunctions) => {
  return async () =>
    await execute({
      functionName: "Pri_11__spawn",
      withSession: true,
      args: [],
      txQueueOptions: { id: defaultEntity },
      onComplete: (receipt) => {
        ampli.systemSpawn({
          ...parseReceipt(receipt),
        });
      },
    });
};
