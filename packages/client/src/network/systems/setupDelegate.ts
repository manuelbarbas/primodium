import { defineComponentSystem } from "@latticexyz/recs";
import { getPrivateKey } from "src/util/burner";
import { entityToAddress } from "src/util/common";
import { components } from "../components";
import { MUD } from "../types";
import { world } from "../world";

export const setupDelegate = (mud: MUD) => {
  defineComponentSystem(world, components.Delegate, ({ entity, value }) => {
    console.log("delegate changed", entity, value);
    if (entity !== mud.playerAccount.entity) return;
    const newDelegate = value[0]?.value;
    if (!newDelegate) return mud.removeSessionAccount();
    console.log("new delegate:", newDelegate);
    const privateKey = getPrivateKey(entityToAddress(newDelegate));
    if (!privateKey) return;
    console.log("new private key:", privateKey);
    mud.updateSessionAccount(privateKey);
  });
};
