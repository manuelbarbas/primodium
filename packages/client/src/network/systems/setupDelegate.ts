import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { entityToAddress } from "src/util/common";
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
  const initialDelegate = components.Delegate.get(playerEntity)?.value;
  if (initialDelegate) setDelegate(initialDelegate);

  function setDelegate(delegate: string) {
    const privateKey = getPrivateKey(entityToAddress(delegate));
    if (!privateKey) return;
    updateSessionAccount(privateKey);
  }

  defineComponentSystem(
    delegateWorld,
    components.Delegate,
    ({ entity, value }) => {
      if (entity !== playerEntity) return;
      const newDelegate = value[0]?.value;
      if (!newDelegate) return removeSessionAccount();
      setDelegate(newDelegate);
    },
    { runOnInit: false }
  );
};
