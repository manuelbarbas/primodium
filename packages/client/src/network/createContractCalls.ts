import { Hex } from "viem";
import { Components, SetupNetworkResult } from "./types";

export function createContractCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { Counter }: Components
) {
  /* -------------------------------------------------------------------------- */
  /*                                 DEV SYSTEMS                                */
  /* -------------------------------------------------------------------------- */

  const increment = async () => {
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    return Counter.get();
  };

  const setRecord = async (tableId: Hex, key: Hex[], data: Hex, schema: Hex) => {
    const tx = await worldContract.write.devSetRecord([tableId, key, data, schema]);
    await waitForTransaction(tx);
  };

  const setField = async (tableId: Hex, key: Hex[], schemaIndex: number, data: Hex, schema: Hex) => {
    const tx = await worldContract.write.devSetField([tableId, key, schemaIndex, data, schema]);
    await waitForTransaction(tx);
  };

  // const pushToField = async (tableId: string, key: string[], schemaIndex: number, dataToPush: string) => {
  //   const tx = await worldContract.write.devPushToField([tableId, key, schemaIndex, dataToPush]);
  //   await waitForTransaction(tx);
  // };

  // const popFromField = async (tableId: string, key: string[], schemaIndex: number, dataToPush: string) => {
  //   const tx = await worldContract.write.devPopFromField([tableId, key, schemaIndex, dataToPush]);
  //   await waitForTransaction(tx);
  // };

  // const updateInField = async (tableId: string, key: string[], schemaIndex: number, dataToPush: string) => {
  //   const tx = await worldContract.write.devUpdateInField([tableId, key, schemaIndex, dataToPush]);
  //   await waitForTransaction(tx);
  // };

  // const deleteRecord = async (tableId: string, key: string[], schemaIndex: number, dataToPush: string) => {
  //   const tx = await worldContract.write.devDeleteRecord([tableId, key, schemaIndex, dataToPush]);
  //   await waitForTransaction(tx);
  // };

  return {
    /* ------------------------------- dev systems ------------------------------ */
    increment,
    setRecord,
    setField,
    // pushToField,
    // popFromField,
    // updateInField,
    // deleteRecord,
  };
}
