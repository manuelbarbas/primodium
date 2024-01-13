import { encodeField } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { ContractComponent } from "@primodiumxyz/mud-game-tools";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export async function removeComponent<S extends Schema>(mud: MUD, component: ContractComponent<S>, entity: Entity) {
  const tableId = component.id as Hex;
  const key = entityToHexKeyTuple(entity);

  await execute(
    {
      mud,
      functionName: "devDeleteRecord",
      systemId: getSystemId("DevSystem"),
      args: [tableId, key],
      delegate: true,
    },
    {
      id: hashEntities(tableId, entity),
    }
  );
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
    await execute(
      {
        mud,
        functionName: "devSetField",
        systemId: getSystemId("DevSystem"),
        args: [tableId, key, schemaIndex, data],
        delegate: true,
      },
      {
        id: hashEntities(tableId, entity),
      }
    );
  });
}
