import { encryptTransactionData } from "@skalenetwork/libte-ts";

export async function getTransactionData(isBite: boolean, params: [`0x${string}`, `0x${string}`]): Promise<string> {
  const functionSelector = "0x3ae7af08"; // Migh need to be changed to be dynamic

  const cleanSystemId = params[0].startsWith("0x") ? params[0].slice(2) : params[0];

  const cleanCallData = params[1].startsWith("0x") ? params[1].slice(2) : params[1];

  const callDataLengthInBytes = cleanCallData.length / 2; // 2 hex chars = 1 byte
  const callDataLengthHex = callDataLengthInBytes.toString(16).padStart(64, "0");

  const offsetHex = "0000000000000000000000000000000000000000000000000000000000000040";

  const finalHex = "00000000000000000000000000000000000000000000000000000000";

  const txData = functionSelector + cleanSystemId + offsetHex + callDataLengthHex + cleanCallData + finalHex;
  if (isBite) {
    return await encryptTransactionData(txData, "https://testnet-v1.skalenodes.com/v1/warm-huge-striped-skale");
  }

  return txData;
}
