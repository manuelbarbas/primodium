import { Entity, Has, defineComponentSystem, namespaceWorld, runQuery } from "@latticexyz/recs";
import { entityToAddress } from "src/util/common";
import { decodeEntity } from "src/util/encode";
import { getPrivateKey } from "src/util/localStorage";
import { Hex } from "viem";
import { components } from "../components";
import { world } from "../world";

export const setupDelegate = (
  playerEntity: Entity,
  removeSessionAccount: () => void,
  updateSessionAccount: (privateKey: Hex) => void
) => {
  world.dispose("delegate");
  const delegateWorld = namespaceWorld(world, "delegate");
  const potentialDelegates = Array.from(runQuery([Has(components.UserDelegationControl)])).filter((entity) => {
    const key = decodeEntity(components.UserDelegationControl.metadata.keySchema, entity);
    return key.delegator === entityToAddress(playerEntity);
  });

  potentialDelegates.find((delegate) => {
    return setDelegate(delegate);
  });

  function setDelegate(delegate: string) {
    const privateKey = getPrivateKey(entityToAddress(delegate));
    if (!privateKey) return false;
    updateSessionAccount(privateKey);
    return true;
  }

  defineComponentSystem(
    delegateWorld,
    components.UserDelegationControl,
    ({ entity, value }) => {
      const key = decodeEntity(components.UserDelegationControl.metadata.keySchema, entity);
      if (key.delegator !== playerEntity) return;
      const newDelegate = key.delegatee;
      if (!value[0]) return removeSessionAccount();
      setDelegate(newDelegate as string);
    },
    { runOnInit: false }
  );
};
