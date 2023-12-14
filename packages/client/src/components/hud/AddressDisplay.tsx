import { useEffect, useState } from "react";
import { useMud } from "src/hooks";
import { shortenAddress } from "src/util/common";
import { Hex } from "viem";

const ensNames: Record<Hex, string | null> = {};
export const AddressDisplay = ({
  className = "",
  address,
  notShort,
}: {
  className?: string;
  address: Hex;
  notShort?: boolean;
}) => {
  const client = useMud().network.publicClient;

  const [ensName, setEnsName] = useState<string>();

  useEffect(() => {
    const name = ensNames[address];
    if (name !== undefined) {
      if (name !== null) setEnsName(name);
      return;
    }
    const fetchEnsName = async () => {
      try {
        const res = await fetch(`${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/ens/by-address/${address}`);
        const { ensName: name } = (await res.json()) as { address: Hex; ensName: string | null };

        if (name) setEnsName(name);
        ensNames[address] = name;
      } catch (error) {
        return;
      }
    };
    fetchEnsName();
  }, [address, client]);

  const addressDisplay = notShort ? address : shortenAddress(address);
  return <p className={className}>{ensName ?? addressDisplay}</p>;
};
