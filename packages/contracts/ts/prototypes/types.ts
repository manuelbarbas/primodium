import { StaticAbiType } from "@latticexyz/schema-type/internal";
import { SchemaInput, StoreInput } from "@latticexyz/store/config/v2";
import { ConfigFieldTypeToPrimitiveType as FieldToPrimitive } from "@latticexyz/store/internal";
import { WorldInput } from "@latticexyz/world/ts/config/v2/input";

type OmitSchemaKeys<Schema, Keys extends readonly string[]> = Omit<Schema, Keys[number]>;

type ExtractSchema<Table> = Extract<Table, { schema: SchemaInput; key: readonly string[] }>;

type TableStructureWithOmittedKeys<Table, T> = {
  [Field in keyof OmitSchemaKeys<ExtractSchema<Table>["schema"], ExtractSchema<Table>["key"]>]?: T extends undefined
    ? FieldToPrimitive<ExtractSchema<Table>["schema"][Field]>
    : ExtractSchema<Table>["schema"][Field] extends T
    ? FieldToPrimitive<ExtractSchema<Table>["schema"][Field]>
    : never;
};

type Tables<W extends WorldInput, T = undefined> = {
  [TableName in keyof W["tables"]]?: TableStructureWithOmittedKeys<W["tables"][TableName], T>;
};

export type PrototypeConfig<W extends WorldInput> = {
  keys?: { [x: string]: StaticAbiType }[];
  tables?: Tables<W>;
  levels?: Record<number, Tables<W>>;
};

export type PrototypesConfig<C extends StoreInput> = Record<string, PrototypeConfig<C>>;

export type ConfigWithPrototypes<W extends WorldInput = WorldInput> = W & {
  prototypeConfig: PrototypesConfig<W>;
};
