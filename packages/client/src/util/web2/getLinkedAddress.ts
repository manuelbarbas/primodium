import { ethers } from "ethers";

export const getLinkedAddress = async () => {
  // Fetch linked address from server using the local browser wallet address
  const wallet = new ethers.Wallet(
    localStorage.getItem("privateKey") as string
  );

  const localAddress = wallet.address;

  try {
    const res = await fetch(
      `${
        import.meta.env.VITE_ACCOUNT_LINK_VERCEL_URL
      }/linked-address/local-to-external/${localAddress}`
    );

    const jsonRes = await res.json();

    return jsonRes;
  } catch (error) {
    return { address: "", ens: "" };
  }
};
