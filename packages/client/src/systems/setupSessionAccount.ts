import { namespaceWorld, query } from "@primodiumxyz/reactive-tables";
import { AccountClient, Core, entityToAddress } from "@primodiumxyz/core";

import { getPrivateKey } from "@/util/localStorage";
import { decodeEntity } from "@primodiumxyz/reactive-tables/utils";
import { Address } from "viem";

export const setupSessionAccount = async (core: Core, account: AccountClient) => {
  const {
    tables,
    network: { world },
  } = core;

  const clientWorld = namespaceWorld(world, "clientSystems");

  const {
    setSessionAccount,
    removeSessionAccount,
    playerAccount: { address },
  } = account;

  function setAuthorized(authorized: string) {
    const privateKey = getPrivateKey(entityToAddress(authorized));

    if (!privateKey) return false;
    setSessionAccount(privateKey);
    return true;
  }

  const potentialAuthorizeds = query({ with: [tables.UserDelegationControl] }).reduce((prev, entity) => {
    const key = decodeEntity(tables.UserDelegationControl.metadata.abiKeySchema, entity) as {
      delegator: Address;
      delegatee: Address;
    };
    if (key.delegator !== address) return prev;
    return [...prev, key.delegatee];
  }, [] as Address[]);

  potentialAuthorizeds.find((authorized) => {
    return setAuthorized(authorized);
  });

  tables.UserDelegationControl.watch(
    {
      world: clientWorld,
      onChange: ({ entity, properties: { current } }) => {
        const key = decodeEntity(tables.UserDelegationControl.metadata.abiKeySchema, entity);
        if (key.delegator !== address) return;
        const newAuthorized = key.delegatee;
        if (!current) return removeSessionAccount();
        setAuthorized(newAuthorized as string);
      },
    },
    { runOnInit: false }
  );
};
