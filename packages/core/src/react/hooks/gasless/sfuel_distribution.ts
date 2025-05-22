import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { skaleNebulaTestnet } from "viem/chains";

import { mineGasForTransaction } from "./miner";

export async function sfuelDistribution(address: Hex) {
  const privateKey = generatePrivateKey();

  const client = createPublicClient({
    chain: skaleNebulaTestnet,
    transport: http(),
  });

  const wallet = createWalletClient({
    chain: skaleNebulaTestnet,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });

  const { gasPrice } = await mineGasForTransaction(0, 100_000, wallet.account.address);
  console.log("Magic Value: ", gasPrice);

  const res = await wallet.sendTransaction({
    to: "0x000E9c53C4e2e21F5063f2e232d0AA907318dccb",
    data: `0x0c11dedd000000000000000000000000${address.substring(2)}`,
    gas: BigInt(100_000),
    gasPrice: BigInt(gasPrice),
  });

  console.log("Res: ", res);

  const receipt = await client.waitForTransactionReceipt({
    hash: res,
  });

  console.log("Receipt: ", receipt);
}
