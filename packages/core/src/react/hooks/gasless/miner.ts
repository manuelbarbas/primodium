import { ethers, getNumber, isHexString, keccak256, randomBytes, toBeHex, toBigInt } from "ethers";

export async function mineGasForTransaction(
  nonce: string | number,
  gas: string | number,
  from: string,
): Promise<{ duration: number; gasPrice: bigint }> {
  const address = from;
  nonce = isHexString(nonce) ? getNumber(nonce) : (nonce as number);
  gas = isHexString(gas) ? getNumber(gas) : (gas as number);
  return await mineFreeGas(gas as number, address, nonce as number);
}

async function mineFreeGas(
  gasAmount: number,
  address: string,
  nonce: number,
): Promise<{ duration: number; gasPrice: bigint }> {
  const MAX_NUMBER = ethers.MaxUint256;

  const nonceHash = toBigInt(keccak256(toBeHex(nonce, 32)));
  const addressHash = toBigInt(keccak256(address));
  const nonceAddressXOR = nonceHash ^ addressHash;
  const divConstant = MAX_NUMBER;
  let candidate: Uint8Array;
  let iterations = 0;

  const start = performance.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    candidate = randomBytes(32);
    const candidateHash = toBigInt(keccak256(candidate));
    const resultHash = nonceAddressXOR ^ candidateHash;
    const externalGas = divConstant / resultHash;

    if (externalGas >= gasAmount) {
      break;
    }
    // every 2k iterations, yield to the event loop
    if (iterations++ % 1_000 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  const end = performance.now();

  return { duration: end - start, gasPrice: toBigInt(candidate) };
}
