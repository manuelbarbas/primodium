import { query } from "@primodiumxyz/reactive-tables";
import { getPrivateKey } from "@/util/localStorage";
import { Address } from "viem";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { entityToAddress } from "@primodiumxyz/core";
import { useEffect } from "react";
import { decodeEntity } from "@primodiumxyz/reactive-tables/utils";

export const useUpdateSessionAccount = () => {
  const {
    network: { world },
    tables,
  } = useCore();

  const {
    setSessionAccount,
    removeSessionAccount,
    playerAccount: { address },
  } = useAccountClient();

  useEffect(() => {
    world.dispose("session");
    // const authorizedWorld = namespaceWorld(world, "session");

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

    function setAuthorized(authorized: string) {
      const privateKey = getPrivateKey(entityToAddress(authorized));

      if (!privateKey) return false;
      setSessionAccount(privateKey);
      return true;
    }

    tables.UserDelegationControl.watch(
      {
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
  }, [address, world, tables.UserDelegationControl, setSessionAccount, removeSessionAccount]);
};
