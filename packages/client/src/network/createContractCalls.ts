import { encodeField } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs/src/types";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { Hex } from "viem";
import { Components, ContractComponent, SetupNetworkResult } from "./types";

//contract calls
// import { spawn } from "src/util/web3/contractCalls/spawn";
// import { demolishBuilding } from "src/util/web3/contractCalls/demolishBuilding";
// import { buildBuilding } from "src/util/web3/contractCalls/buildBuilding";
// import { claimObjective } from "src/util/web3/contractCalls/claimObjective";

export function createContractCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { Counter, CurrentTransaction }: Components
) {
  /* -------------------------------------------------------------------------- */
  /*                                 DEV SYSTEMS                                */
  /* -------------------------------------------------------------------------- */

  const increment = async () => {
    CurrentTransaction.set({ value: true });
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);

    CurrentTransaction.set({ value: false });
    return Counter.get();
  };
  async function removeComponent<S extends Schema>(component: ContractComponent<S>, entity: Entity) {
    const tableId = component.id as Hex;
    const key = entityToHexKeyTuple(entity);

    const tx = await worldContract.write.devDeleteRecord([tableId, key]);
    await waitForTransaction(tx);
  }

  async function setComponentValue<S extends Schema>(
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
      const tx = await worldContract.write.devSetField([tableId, key, schemaIndex, data]);
      await waitForTransaction(tx);
    });
  }

  return {
    /* ------------------------------- Dev Systems ------------------------------ */
    increment,
    removeComponent,
    setComponentValue,

    /* ------------------------------- Game Systems ------------------------------ */
    // spawn,
    // demolishBuilding,
    // buildBuilding,
    // claimObjective,
  };
}
