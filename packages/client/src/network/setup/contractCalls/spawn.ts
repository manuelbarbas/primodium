import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute, executeBatch } from "src/network/actions";
import { MUD } from "src/network/types";
import { UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (mud: MUD) => {
  await execute(
    {
      mud,
      systemId: getSystemId("SpawnSystem"),
      functionName: "spawn",
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};

export const spawnAndAuthorizeSessionAccount = async (mud: MUD, sessionAccount: Hex) => {
  const spawn = {
    mud,
    systemId: getSystemId("SpawnSystem"),
    functionName: "spawn",
  } as const;

  const authorize = {
    systemId: getSystemId("core"),
    functionName: "registerDelegation" as const,
    args: [sessionAccount, UNLIMITED_DELEGATION, "0x0"] as [Hex, Hex, Hex],
    withSession: false,
  };

  // await execute({ mud, ...authorize });
  await executeBatch(
    {
      mud,
      systemCalls: [spawn, authorize],
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
