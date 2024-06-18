import { ExecuteFunctions } from "@primodiumxyz/core";
import {
  defaultEntity,
  AbiToSchema,
  Entity,
  ContractTable,
  ContractTableDef,
  Properties,
} from "@primodiumxyz/reactive-tables";
import {
  encodeEntity,
  encodeField,
  entityToHexKeyTuple,
  StaticAbiType,
  uuid,
} from "@primodiumxyz/reactive-tables/utils";
import { Hex, padHex } from "viem";

export function createDevCalls({ execute }: ExecuteFunctions) {
  async function removeTable<tableDef extends ContractTableDef = ContractTableDef>(
    table: ContractTable<tableDef>,
    entity: Entity
  ) {
    const tableId = table.id as Hex;
    const key = entityToHexKeyTuple(entity);

    await execute({
      functionName: "Pri_11__devDeleteRecord",
      args: [tableId, key],
      withSession: true,
      txQueueOptions: {
        id: entity,
      },
    });
  }

  async function setTableValue<
    tableDef extends ContractTableDef = ContractTableDef,
    table extends ContractTable<tableDef> = ContractTable<tableDef>
  >(
    table: table,
    keys: Properties<AbiToSchema<table["metadata"]["abiKeySchema"]>>,
    newValues: Partial<Properties<table["propertiesSchema"]>>
  ) {
    if (Object.entries(keys).length === 0) keys = { entity: padHex(defaultEntity, { size: 32 }) };
    const tableId = table.id as Hex;
    console.log({ table });

    const schema = Object.keys(table.metadata.abiPropertiesSchema);
    console.log({ schema, keys, keySchema: table.metadata.abiKeySchema });
    const key = encodeEntity(table.metadata.abiKeySchema, keys);
    Object.entries(newValues).forEach(async ([name, value]) => {
      const type = table.metadata.abiPropertiesSchema[name] as StaticAbiType;
      const data = encodeField(type, value);
      const schemaIndex = schema.indexOf(name);
      await execute({
        functionName: "Pri_11__devSetField",
        args: [tableId, [key], schemaIndex, data],
        withSession: true,
        txQueueOptions: {
          id: uuid(),
          force: true,
        },
      });
    });
  }

  return {
    removeTable,
    setTableValue,
  };
}
