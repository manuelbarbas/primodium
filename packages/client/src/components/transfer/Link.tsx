import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useMud } from "src/hooks";
import { Hex, trim } from "viem";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "../core/Button";
import { AddressDisplay } from "../hud/AddressDisplay";

type LocalToExternalResponse = { address: Hex | null; ensName: string | null };

export function Link() {
  const [linkedAddress, setLinkedAddress] = useState<LocalToExternalResponse>({ address: null, ensName: null });
  const [signature, setSignature] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();
  const externalAccount = useAccount();
  const { network } = useMud();

  const burnerAddress = trim(network.address);

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      const res = await fetch(
        `${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/linked-address/local-to-external/${burnerAddress}`
      );
      console.log("res:", res);
      const responseJSON = await res.json();
      setLinkedAddress(responseJSON);
    };
    fetchLocalLinkedAddress();
  }, [externalAccount.address, burnerAddress]);

  useEffect(() => {
    const createMessage = async () => {
      const localSignature = await network.walletClient.signMessage({ message: network.address });
      setSignature(localSignature);
    };
    createMessage();
  }, [network.walletClient, network.address]);

  const signMessageAndLink = async () => {
    if (!externalAccount || !externalAccount.address) return;
    try {
      const externalSignature = await signMessageAsync({ message: externalAccount.address });

      const body = {
        burnerAddress,
        signature,
        externalAddress: externalAccount.address,
        externalSignature,
      };
      console.log("body:", body);
      const res = await fetch(`${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/link`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        method: "POST",
      });
      console.log("res:", res);
      const jsonRes = await res.json();
      console.log("resjson:", jsonRes);

      if (res.status !== 200) {
        console.log(jsonRes);
        toast.error(jsonRes.message);
      } else {
        toast.success(jsonRes.message);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(JSON.stringify(error));
      }
    }
  };

  if (!externalAccount.address) return null;
  if (linkedAddress.address === externalAccount.address)
    return <div className="text-left text-gray-300">These accounts are linked</div>;
  return (
    <div className="flex flex-col h-full gap-2 text-left">
      <div className="text-xs text-gray-300">
        Link your account (
        {linkedAddress.address ? (
          <>
            linked to
            <AddressDisplay address={linkedAddress.address} />
          </>
        ) : (
          "unlinked"
        )}
        )
      </div>
      <AddressDisplay address={burnerAddress} notShort className="p-2 bg-gray-700 text-white text-center" />
      <p className="text-xs text-gray-300"> to your Primodium address</p>
      <AddressDisplay address={externalAccount.address} notShort className="p-2 bg-gray-700 text-white text-center" />
      <Button className="btn-secondary disabled:opacity-50 flex-1" onClick={signMessageAndLink}>
        <div className="font-bold crt">Link Accounts</div>
      </Button>
    </div>
  );
}
