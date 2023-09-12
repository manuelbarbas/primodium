import { StaticAbiType } from "@latticexyz/schema-type/deprecated";
import { ConfigFieldTypeToPrimitiveType, StoreConfig } from "@latticexyz/store";

export type PrototypeConfig<C extends StoreConfig> = {
  keys?: Record<string, StaticAbiType>;
} & {
  tables: {
    [Table in keyof C["tables"]]?: {
      [Field in keyof C["tables"][Table]["schema"]]: ConfigFieldTypeToPrimitiveType<
        C["tables"][Table]["schema"][Field]
      >;
    };
  };
  levels?: {
    [Table in keyof C["tables"]]?: Record<
      number,
      {
        [Field in keyof C["tables"][Table]["schema"]]: ConfigFieldTypeToPrimitiveType<
          C["tables"][Table]["schema"][Field]
        >;
      }
    >;
  };
};

export type PrototypesConfig<C extends StoreConfig> = Record<string, PrototypeConfig<C>>;

export type StoreConfigWithPrototypes = StoreConfig & {
  prototypes: PrototypesConfig<StoreConfig>;
};
