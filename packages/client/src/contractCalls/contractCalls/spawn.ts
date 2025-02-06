import { ExecuteFunctions } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";
import { ampli } from "@/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

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
