import { useEffect, useState } from "react";
import { useMud } from "src/hooks";
import { shortenAddress } from "src/util/common";
import { Hex } from "viem";
import { getEnsName } from "viem/actions";

const ensNames: Record<Hex, string | null> = {};
export const AddressDisplay = ({ address, notShort }: { address: Hex; notShort?: boolean }) => {
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
        const name = await getEnsName(client, { address });
        if (name) setEnsName(name);
        ensNames[address] = name;
      } catch (error) {
        return;
      }
    };
    fetchEnsName();
  }, [address, client]);

  const addressDisplay = notShort ? address : shortenAddress(address);
  return <>{ensName ?? addressDisplay}</>;
};
