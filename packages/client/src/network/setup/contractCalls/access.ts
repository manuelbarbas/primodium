import { singletonEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType, UNLIMITED_DELEGATION } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address } from "viem";

export const grantAccess = async (mud: MUD, address: Address) => {
  await execute(
    {
      mud,
      systemId: getSystemId("DelegationSystem"),
      functionName: "registerDelegation",
      args: [address, UNLIMITED_DELEGATION, "0x0"],
    },
    {
      id: singletonEntity,
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};

export const revokeAccess = async (mud: MUD, address: Address) => {
  await execute(
    { mud, systemId: getSystemId("DelegationSystem"), functionName: "unregisterDelegation", args: [address] },
    {
      id: singletonEntity,
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
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
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};
