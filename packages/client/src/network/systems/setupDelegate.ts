import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { getPrivateKey } from "src/util/burner";
import { entityToAddress } from "src/util/common";
import { components } from "../components";
import { MUD } from "../types";
import { world } from "../world";

export const setupDelegate = (mud: MUD) => {
  const delegateWorld = namespaceWorld(world, "delegate");
  const initialDelegate = components.Delegate.get(mud.playerAccount.entity)?.value;
  if (initialDelegate) setDelegate(initialDelegate);

  function setDelegate(delegate: string) {
    const privateKey = getPrivateKey(entityToAddress(delegate));
    if (!privateKey) return;
    mud.updateSessionAccount(privateKey);
  }

  defineComponentSystem(
    delegateWorld,
    components.Delegate,
    ({ entity, value }) => {
      if (entity !== mud.playerAccount.entity) return;
      const newDelegate = value[0]?.value;
      if (!newDelegate) return mud.removeSessionAccount();
      setDelegate(newDelegate);
    },
    { runOnInit: false }
  );
};
