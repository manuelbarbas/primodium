import { singletonEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { Address } from "viem";

export const grantAccess = async (mud: MUD, address: Address) => {
  await execute(
    mud,
    (account) => account.worldContract.write.grantAccess([address]),
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

export const switchDelegate = async (mud: MUD, address: Address) => {
  await execute(
    mud,
    (account) => account.worldContract.write.switchDelegate([address]),
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

export const revokeAccessDelegate = async (mud: MUD) => {
  await execute(
    mud,
    (account) => account.worldContract.write.revokeAccessDelegate(),
    {
      id: singletonEntity,
      delegate: true,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};

export const revokeAccessOwner = async (mud: MUD) => {
  await execute(
    mud,
    (account) => account.worldContract.write.revokeAccessOwner(),
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
