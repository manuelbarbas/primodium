import { encodeField } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { ContractComponent } from "@primodiumxyz/mud-game-tools";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export async function removeComponent<S extends Schema>(mud: MUD, component: ContractComponent<S>, entity: Entity) {
  const tableId = component.id as Hex;
  const key = entityToHexKeyTuple(entity);

  await execute(mud, (account) => account.worldContract.write.devDeleteRecord([tableId, key]), {
    id: hashEntities(tableId, entity),
    delegate: true,
  });
}

export async function setComponentValue<S extends Schema>(
  mud: MUD,

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
    await execute(mud, (account) => account.worldContract.write.devSetField([tableId, key, schemaIndex, data]), {
      id: hashEntities(tableId, entity),
      delegate: true,
    });
  });
}
