import { encodeField } from "@latticexyz/protocol-parser";
import { ComponentValue, Entity, Schema } from "@latticexyz/recs/src/types";
import { StaticAbiType } from "@latticexyz/schema-type";
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { Hex } from "viem";
import { components } from "./components";
import { Components, ContractComponent, SetupNetworkResult } from "./types";
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

  /* -------------------------------------------------------------------------- */
  /*                                GAME SYSTEMS                                */
  /* -------------------------------------------------------------------------- */

  async function spawn() {
    CurrentTransaction.set({ value: true });
    const tx = await worldContract.write.spawn();
    await waitForTransaction(tx);
    CurrentTransaction.set({ value: false });
  }

  async function demolishBuilding(coord: Coord) {
    CurrentTransaction.set({ value: true });
    const activeAsteroid = components.Home.get()?.asteroid;
    if (!activeAsteroid) return;

    const position = { ...coord, parent: activeAsteroid as Hex };
    const tx = await worldContract.write.destroy([position]);
    await waitForTransaction(tx);
    CurrentTransaction.set({ value: false });
  }
  return {
    /* ------------------------------- Dev Systems ------------------------------ */
    increment,
    removeComponent,
    setComponentValue,

    /* ------------------------------- Game Systems ------------------------------ */
    spawn,
    demolishBuilding,
  };
}
