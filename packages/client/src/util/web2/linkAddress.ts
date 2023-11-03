import { SetupNetworkResult } from "src/network/types";

export const linkAddress = async (network: SetupNetworkResult) => {
  // Sign player wallet address using the local browser wallet address
  // External wallet addresses don't need to be linked to another external wallet address
  // because they are already owned by the player and can be displayed directly on the UI
  const localSignature = await network.walletClient.signMessage({ message: network.address });

  // Opens the linking page in a new window served from the following repo: account-link-vercel
  return window.open(
    `${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/?localAddress=${network.address}&localSignature=${localSignature}`
  );
};
