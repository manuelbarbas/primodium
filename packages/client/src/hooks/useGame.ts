import { useCallback, useEffect, useState } from "react";
import { setup } from "src/network/setup/setup";
import { setupBurnerAccount } from "src/network/setup/setupBurnerAccount";
import { setupExternalAccount } from "src/network/setup/setupExternalAccount";
import { BurnerAccount, ExternalAccount, SetupResult } from "src/network/types";
import { Hex } from "viem";

const useGame = () => {
  const [network, setNetwork] = useState<SetupResult>(); // Created once when the site loads
  const [sessionAccount, setSessionAccount] = useState<BurnerAccount>();
  const [playerAccount, setPlayerAccount] = useState<BurnerAccount | ExternalAccount>();

  useEffect(() => {
    setup().then((network) => setNetwork(network));
  }, []);

  const updateSessionAccount = useCallback((pKey: Hex) => {
    setupBurnerAccount(pKey).then((account) => setSessionAccount(account));
  }, []);

  const updatePlayerAccount = useCallback((address: Hex) => {
    setupExternalAccount(address).then((account) => setPlayerAccount(account));
  }, []);

  return {
    network: network?.network,
    components: network?.components,
    contractCalls: network?.contractCalls,
    sessionAccount,
    playerAccount,
    updateSessionAccount,
    updatePlayerAccount,
  };
};

export default useGame;

// if (networkConfig.faucetServiceUrl) {
//   const faucet = createFaucetClient({ url: networkConfig.faucetServiceUrl });
//   const sessionAddress = sessionAccount.address;
//   const playerAddress = playerAccount.address;

//   const requestDrip = async (address: Hex) => {
//     let balance = await publicClient.getBalance({ address });
//     console.log("[Faucet] balance:", formatEther(balance));
//     balance = await publicClient.getBalance({ address });
//     const lowBalance = balance < minEth;
//     if (lowBalance) {
//       console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
//       await faucet.drip.mutate({ address: address });
//       balance = await publicClient.getBalance({ address });
//       console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
//     }
//   };

//   requestDrip(sessionAddress);
//   setInterval(() => requestDrip(sessionAddress), 4000);
//   if (sessionAddress !== playerAddress) {
//     requestDrip(playerAddress);
//     setInterval(() => requestDrip(playerAddress), 4000);
//   }
// }

// if (networkConfig.chainId === "dev" && import.meta.env.PRI_DEV_PKEY) {
//   const devDrip = async (address: Hex) => {
//     const daddyPKey = import.meta.env.PRI_DEV_PKEY;
//     const daddyAccount = createBurnerAccount(daddyPKey as Hex);
//     const daddyWalletClient = createWalletClient({
//       ...clientOptions,
//       account: daddyAccount,
//     });
//     const balance = await publicClient.getBalance({ address });
//     const lowBalance = balance < minEth;
//     if (!lowBalance) return;
//     await daddyWalletClient.sendTransaction({ to: address, value: 69n * 10n ** 18n });
//     console.log(`[Drip] Dripped ${formatEther(minEth)} to ${address}`);
//   };
//   devDrip(playerAccount.address);
//   setInterval(() => devDrip(playerAccount.address), 4000);
// }
