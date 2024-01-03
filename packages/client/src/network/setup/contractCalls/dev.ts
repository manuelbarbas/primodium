import { encodeField } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { ContractComponent } from "@primodiumxyz/mud-game-tools";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export async function removeComponent<S extends Schema>(
  network: SetupNetworkResult,
  account: AnyAccount,
  component: ContractComponent<S>,
  entity: Entity
) {
  const tableId = component.id as Hex;
  const key = entityToHexKeyTuple(entity);

  const tx = await account.worldContract.write.devDeleteRecord([tableId, key]);
  await network.waitForTransaction(tx);
}

export async function setComponentValue<S extends Schema>(
  network: SetupNetworkResult,
  account: AnyAccount,
  component: ContractComponent<S>,
  entity: Entity,
  newValues: Partial<ComponentValue<S>>
) {
  const tableId = component.id as Hex;
  const key = entityToHexKeyTuple(entity);

  const schema = Object.keys(component.metadata.valueSchema);
  Object.entries(newValues).forEach(async ([name, value]) => {
    const type = component.metadata.valueSchema[name] as StaticAbiType;
    const data = encodeField(type, value);
    const schemaIndex = schema.indexOf(name);
    const tx = await account.worldContract.write.devSetField([tableId, key, schemaIndex, data]);
    await network.waitForTransaction(tx);
  });
}
