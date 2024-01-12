import { Has, runQuery } from "@latticexyz/recs";
import { decodeEntity, singletonEntity } from "@latticexyz/store-sync/recs";
import { execute, executeBatch } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { TransactionQueueType, UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address, Hex } from "viem";

export const grantAccess = async (mud: MUD, address: Address) => {
  await execute(
    {
      mud,
      systemId: getSystemId("DelegationSystem"),
      functionName: "registerDelegation",
      args: [address, UNLIMITED_DELEGATION, "0x0"],
      delegate: false,
    },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAccess = async (mud: MUD, address: Address) => {
  await execute(
    { mud, systemId: getSystemId("DelegationSystem"), functionName: "unregisterDelegation", args: [address] },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};

export const revokeAllAccess = async (mud: MUD) => {
  const allDelegates = [...runQuery([Has(components.UserDelegationControl)])].reduce((prev, entity) => {
    const key = decodeEntity(components.UserDelegationControl.metadata.keySchema, entity) as {
      delegator: Address;
      delegatee: Address;
    };
    if (key.delegator !== mud.playerAccount.address) return prev;
    return [...prev, key.delegatee];
  }, [] as Address[]);

  const systemCalls = allDelegates.map((delegatee) => ({
    systemId: getSystemId("DelegationSystem"),
    functionName: "unregisterDelegation",
    args: [delegatee],
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

export const switchDelegate = async (mud: MUD, newDelegate: Address) => {
  const currentDelegate = mud.sessionAccount?.address;
  if (!currentDelegate) return;

  await execute(
    {
      mud,
      systemId: getSystemId("DelegationSystem"),
      functionName: "unregisterDelegation",
      args: [newDelegate],
    },
    {
      id: singletonEntity,
      type: TransactionQueueType.Access,
    }
  );
};
