import { AbiToSchema, Entity, ContractTable, ContractTableDef, Properties } from "@primodiumxyz/reactive-tables";
import {
  encodeEntity,
  encodeField,
  entityToHexKeyTuple,
  StaticAbiType,
  uuid,
} from "@primodiumxyz/reactive-tables/utils";
import { getSystemId } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";

export function createDevCalls({ execute }: ExecuteFunctions) {
  async function removeTable<tableDef extends ContractTableDef = ContractTableDef>(
    table: ContractTable<tableDef>,
    entity: Entity
  ) {
    const tableId = table.id;
    const key = entityToHexKeyTuple(entity);

    await execute(
      {
        functionName: "Pri_11__devDeleteRecord",
        systemId: getSystemId("DevSystem"),
        args: [tableId, key],
        withSession: true,
      },
      {
        id: entity,
      }
    );
  }

  async function setTableValue<
    tableDef extends ContractTableDef = ContractTableDef,
    table extends ContractTable<tableDef> = ContractTable<tableDef>
  >(
    table: table,
    keys: Properties<AbiToSchema<table["metadata"]["abiKeySchema"]>>,
    newValues: Partial<Properties<table["propertiesSchema"]>>
  ) {
    const tableId = table.id;

    const schema = Object.keys(table.metadata.abiPropertiesSchema);
    const key = encodeEntity(table.metadata.abiKeySchema, keys);
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
          id: uuid(),
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
