import { components } from "src/network/components";

export const getLinkedAddress = async () => {
  const localAddress = components.Account.get()?.value;
  if (!localAddress) return { address: "", ens: "" };

  try {
    const res = await fetch(
      `${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/linked-address/local-to-external/${localAddress}`
    );

    const jsonRes = await res.json();

    return jsonRes;
  } catch (error) {
    return { address: "", ens: "" };
  }
};
