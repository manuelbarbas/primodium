import { Has, runQuery } from "@latticexyz/recs";
import { decodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { execute, executeBatch } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType, UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address, Hex } from "viem";

export const grantAccess = async (mud: MUD, address: Address) => {
  await execute(
    {
      mud,
      systemId: getSystemId("Registration", ""),
      functionName: "registerDelegation",
      args: [address, UNLIMITED_DELEGATION, "0x0"],
      withSession: false,
    },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAccess = async (mud: MUD, address: Address) => {
  await execute(
    { mud, systemId: getSystemId("Registration"), functionName: "unregisterDelegation", args: [address] },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAllAccess = async (mud: MUD) => {
  const allAuthorized = [...runQuery([Has(components.UserDelegationControl)])].reduce((prev, entity) => {
    const key = decodeEntity(components.UserDelegationControl.metadata.keySchema, entity) as {
      delegator: Address;
      delegatee: Address;
    };
    if (key.delegator !== mud.playerAccount.address) return prev;
    return [...prev, key.delegatee];
  }, [] as Address[]);

  const systemCalls = allAuthorized.map((authorized) => ({
    systemId: getSystemId("Registration"),
    functionName: "unregisterDelegation",
    args: [authorized],
  })) as {
    systemId: Hex;
    functionName: "unregisterDelegation";
    args: [Hex];
  }[];

  await executeBatch(
    { mud, systemCalls },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};
