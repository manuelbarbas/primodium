import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser";
import { Schema } from "@latticexyz/recs";
import { hexKeyTupleToEntity } from "@latticexyz/store-sync/recs";
import { ContractComponent } from "src/network/types";
import { encodeAbiParameters } from "viem";

export function encodeEntity<S extends Schema, TKeySchema extends KeySchema>(
  component: ContractComponent<S, TKeySchema>,
  key: SchemaToPrimitives<TKeySchema>
) {
  const keySchema = component.metadata.keySchema;
  if (Object.keys(keySchema).length !== Object.keys(key).length) {
    throw new Error(
      `key length ${Object.keys(key).length} does not match key schema length ${Object.keys(keySchema).length}`
    );
  }
  return hexKeyTupleToEntity(
    Object.entries(keySchema).map(([keyName, type]) => encodeAbiParameters([{ type }], [key[keyName]]))
  );
}
