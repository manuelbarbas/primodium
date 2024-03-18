import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute, executeBatch } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawnu = async (mud: MUD) => {
  await execute(
    {
      mud,
      systemId: getSystemId("SpawnSystem"),
      functionName: "Primodium__spawn",
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
    functionName: "Primodium__spawn",
    withSession: false,
  } as const;

  const authorize = {
    systemId: getSystemId("Registration", ""),
    functionName: "registerDelegation" as const,
    args: [sessionAccount, UNLIMITED_DELEGATION, "0x0"] as [Hex, Hex, Hex],
    withSession: false,
  };

  console.log("spawn:", spawn);
  // console.log("authorize:", authorize);

  await executeBatch(
    {
      mud,
      systemCalls: [spawn, authorize],
      withSession: false,
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
    }
  );
};
