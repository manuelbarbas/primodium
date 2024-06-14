import { ExecuteFunctions } from "@primodiumxyz/core";
import { Entity, ContractTable } from "@primodiumxyz/reactive-tables";

export function createDevCalls({ execute }: ExecuteFunctions) {
  execute;
  // async function removeTable<tableDef extends ContractTableDef = ContractTableDef>(
  //   table: ContractTable<tableDef>,
  //   entity: Entity
  // ) {
  //   const tableId = table.id;
  //   const key = entityToHexKeyTuple(entity);

  //   await execute(
  //     {
  //       functionName: "Pri_11__devDeleteRecord",
  //
  //       args: [tableId, key],
  //       withSession: true,
  //     },
  //     {
  //       id: entity,
  //     }
  //   );
  // }

  // async function setTableValue<tableDef extends ContractTableDef = ContractTableDef>(
  //   table: ContractTable<tableDef, PS>,
  //   keys: SchemaToPrimitives<PS>,
  //   newValues: Partial<Properties<PS>>
  // ) {
  //   const tableId = table.id;

  //   const schema = Object.keys(table.metadata.abiPropertiesSchema);
  //   const key = encodeKey(table.metadata.abiKeySchema, keys);
  //   Object.entries(newValues).forEach(async ([name, value]) => {
  //     const type = table.metadata.abiPropertiesSchema[name] as StaticAbiType;
  //     const data = encodeField(type, value);
  //     const schemaIndex = schema.indexOf(name);
  //     await execute(
  //       {
  //         functionName: "Pri_11__devSetField",
  //
  //         args: [tableId, key, schemaIndex, data],
  //         withSession: true,
  //       },
  //       {
  //         id: uuid(),
  //         force: true,
  //       }
  //     );
  //   });
  // }

  return {
    removeTable: async (table: ContractTable, entity: Entity) => {
      table;
      entity;
    },
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    setTableValue: async (table: any, keys: any, newValues: any) => {
      table;
      keys;
      newValues;
    },
  };
}
