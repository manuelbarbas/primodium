import { uuid } from "@/util/uuid";
import { encodeField, encodeKey, SchemaToPrimitives } from "@latticexyz/protocol-parser/internal";
import { StaticAbiType } from "@latticexyz/schema-type/internal";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { Entity, ContractTableDef, ContractTable, Properties } from "@primodiumxyz/reactive-tables";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";

export function createDevCalls({ execute }: ExecuteFunctions) {
  async function removeTable<tableDef extends ContractTableDef = ContractTableDef>(
    table: ContractTable<tableDef>,
    entity: Entity
  ) {
    const tableId = table.id as Hex;
    const key = entityToHexKeyTuple(entity);

    await execute(
      {
        functionName: "Pri_11__devDeleteRecord",
        systemId: getSystemId("DevSystem"),
        args: [tableId, key],
        withSession: true,
      },
      {
        id: hashEntities(tableId, entity),
      }
    );
  }

  async function setTableValue<tableDef extends ContractTableDef = ContractTableDef>(
    table: ContractTable<tableDef, PS>,
    keys: SchemaToPrimitives<PS>,
    newValues: Partial<Properties<PS>>
  ) {
    const tableId = table.id as Hex;

    const schema = Object.keys(table.metadata.abiPropertiesSchema);
    const key = encodeKey(table.metadata.abiKeySchema, keys);
    Object.entries(newValues).forEach(async ([name, value]) => {
      const type = table.metadata.abiPropertiesSchema[name] as StaticAbiType;
      const data = encodeField(type, value);
      const schemaIndex = schema.indexOf(name);
      await execute(
        {
          functionName: "Pri_11__devSetField",
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
  return {
    removeTable,
    setTableValue,
  };
}
