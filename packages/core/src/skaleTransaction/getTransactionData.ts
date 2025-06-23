//import { encryptTransactionData } from "@skalenetwork/libte-ts";

export async function getTransactionData(
  isBite: boolean,
  isDelegated: boolean,
  params: `0x${string}`[],
): Promise<string> {
  //function selectors for Call and CallFrom
  let functionSelector = "";
  let cleanSystemId = "";
  let cleanCallData = "";
  let offsetHex = "";
  const finalHex = "00000000000000000000000000000000000000000000000000000000";
  let callDataLengthInBytes;
  let callDataLengthHex = "";

  if (isDelegated) {
    functionSelector = "0x894ecc58";
    const initOffset = "000000000000000000000000";
    cleanSystemId =
      initOffset +
      (params[0].startsWith("0x") ? params[0].slice(2) : params[0]) +
      (params[1].startsWith("0x") ? params[1].slice(2) : params[1]);
    cleanCallData = params[2].startsWith("0x") ? params[2].slice(2) : params[2];
    callDataLengthInBytes = cleanCallData.length / 2;
    callDataLengthHex = callDataLengthInBytes.toString(16).padStart(64, "0");

    offsetHex = "0000000000000000000000000000000000000000000000000000000000000060";
  } else {
    functionSelector = "0x3ae7af08";

    cleanSystemId = params[0].startsWith("0x") ? params[0].slice(2) : params[0];

    cleanCallData = params[1].startsWith("0x") ? params[1].slice(2) : params[1];

    callDataLengthInBytes = cleanCallData.length / 2;

    callDataLengthHex = callDataLengthInBytes.toString(16).padStart(64, "0");

    offsetHex = "0000000000000000000000000000000000000000000000000000000000000040";
  }

  /* const cleanSystemId = params[0].startsWith("0x") ? params[0].slice(2) : params[0];

  const cleanCallData = params[1].startsWith("0x") ? params[1].slice(2) : params[1];

  const callDataLengthInBytes = cleanCallData.length / 2; // 2 hex chars = 1 byte
  const callDataLengthHex = callDataLengthInBytes.toString(16).padStart(64, "0");

  const offsetHex = "0000000000000000000000000000000000000000000000000000000000000040";*/

  const txData = functionSelector + cleanSystemId + offsetHex + callDataLengthHex + cleanCallData + finalHex;

  if (isBite) {
    //return await encryptTransactionData(txData, "https://testnet-v1.skalenodes.com/v1/warm-huge-striped-skale");
    return txData;
  }

  return txData;
}
