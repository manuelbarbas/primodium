import { signCall } from "@/network/txExecute/txExecuteWithSignature";
import { WorldAbi } from "@/network/world";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/txExecute/txExecute";
import { executeBatch } from "src/network/txExecute/txExecuteBatch";
import { MUD } from "src/network/types";
import { UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { encodeFunctionData } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const spawn = async (mud: MUD) => {
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

export const spawnAndAuthorizeSessionAccount = async (mud: MUD) => {
  const sessionAccount = mud.sessionAccount;
  if (!sessionAccount) throw new Error("Session account not found. Please connect session account first.");

  const delegateCallData = encodeFunctionData({
    abi: WorldAbi,
    functionName: "registerDelegation",
    args: [sessionAccount.address, UNLIMITED_DELEGATION, "0x"],
  });

  const signature = await signCall({
    userAccountClient: mud.playerAccount.walletClient,
    worldAddress: mud.playerAccount.worldContract.address,
    systemId: getSystemId("Registration", "CORE"),
    callData: delegateCallData,
  });
  console.log({ delegateCallData, signature });

  const authorize = {
    abi: WorldAbi,
    systemId: getSystemId("Delegation", "CORE"),
    functionName: "callWithSignature" as const,
    args: [mud.playerAccount.address, getSystemId("Registration", "CORE"), delegateCallData, signature],
  };

  const spawn = {
    mud,
    systemId: getSystemId("SpawnSystem"),
    functionName: "Primodium__spawn",
  } as const;

  await executeBatch(
    {
      mud,
      systemCalls: [authorize, spawn],
      withSession: true,
    },
    { id: singletonEntity },
    (receipt) => {
      ampli.systemSpawn({
        ...parseReceipt(receipt),
      });
      ampli.systemRegisterDelegation({
        delegateAddress: sessionAccount.address,
        ...parseReceipt(receipt),
      });
    }
  );
};
