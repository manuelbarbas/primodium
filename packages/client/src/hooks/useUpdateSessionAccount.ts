import { query } from "@primodiumxyz/reactive-tables";
import { entityToAddress } from "src/util/common";
import { decodeEntity } from "src/util/encode";
import { getPrivateKey } from "src/util/localStorage";
import { Address } from "viem";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { useEffect } from "react";

export const useUpdateSessionAccount = () => {
  const {
    setSessionAccount,
    removeSessionAccount,
    playerAccount: { address },
  } = useAccountClient();
  const core = useCore();
  const {
    network: { world },
    tables,
  } = core;

  useEffect(() => {
    world.dispose("session");
    // const authorizedWorld = namespaceWorld(world, "session");

    const potentialAuthorizeds = query({ with: [tables.UserDelegationControl] }).reduce((prev, entity) => {
      const key = decodeEntity(tables.UserDelegationControl.metadata.keySchema, entity) as {
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
        onChange: ({ entity, current }) => {
          const key = decodeEntity(tables.UserDelegationControl.metadata.keySchema, entity);
          if (key.delegator !== address) return;
          const newAuthorized = key.delegatee;
          if (!current) return removeSessionAccount();
          setAuthorized(newAuthorized as string);
        },
      },
      { runOnInit: false }
    );
  }, [address]);
};
