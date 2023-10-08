import { ethers } from "ethers";

export const linkAddress = async () => {
  // Sign player wallet address using the local browser wallet address
  // External wallet addresses don't need to be linked to another external wallet address
  // because they are already owned by the player and can be displayed directly on the UI

  if (!localStorage.getItem("privateKey")) {
    return;
  }

  const wallet = new ethers.Wallet(localStorage.getItem("privateKey") as string);

  const localAddress = wallet.address;
  const localSignature = await wallet.signMessage(localAddress);

  // Opens the linking page in a new window served from the following repo: account-link-vercel
  return window.open(
    `${import.meta.env.VITE_ACCOUNT_LINK_VERCEL_URL}/?localAddress=${localAddress}&localSignature=${localSignature}`
  );
};
