import { KeySchema, SchemaToPrimitives, encodeField, encodeKey } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { uuid } from "@latticexyz/utils";
import { ContractComponent } from "@primodiumxyz/mud-game-tools";
import { ExtendedContractComponent } from "src/network/components/customComponents/ExtendedComponent";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export async function removeComponent<S extends Schema>(mud: MUD, component: ContractComponent<S>, entity: Entity) {
  const tableId = component.id as Hex;
  const key = entityToHexKeyTuple(entity);

  await execute(
    {
      mud,
      functionName: "Primodium__devDeleteRecord",
      systemId: getSystemId("DevSystem"),
      args: [tableId, key],
      withSession: true,
    },
    {
      id: hashEntities(tableId, entity),
    }
  );
}

export async function setComponentValue<S extends Schema, K extends KeySchema>(
  mud: MUD,
  component: ExtendedContractComponent<S, K>,
  keys: SchemaToPrimitives<K>,
  newValues: Partial<ComponentValue<S>>
) {
  const tableId = component.id as Hex;

  const schema = Object.keys(component.metadata.valueSchema);
  const key = encodeKey(component.metadata.keySchema, keys);
  Object.entries(newValues).forEach(async ([name, value]) => {
    const type = component.metadata.valueSchema[name] as StaticAbiType;
    const data = encodeField(type, value);
    const schemaIndex = schema.indexOf(name);
    await execute(
      {
        mud,
        functionName: "Primodium__devSetField",
        systemId: getSystemId("DevSystem"),
        args: [tableId, key, schemaIndex, data],
        withSession: true,
      },
      {
        id: uuid() as Entity,
        force: true,
      }
    );
  });
}
