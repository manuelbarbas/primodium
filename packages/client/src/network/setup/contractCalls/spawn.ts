import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (mud: MUD) => {
  await execute(
    {
      mud,
      systemId: getSystemId("SpawnSystem"),
      functionName: "Primodium__spawn",
      withSession: true,
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
