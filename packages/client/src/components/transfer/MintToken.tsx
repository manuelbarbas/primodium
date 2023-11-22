import { useEffect, useState } from "react";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { Hex, createPublicClient, isHex } from "viem";
import { getEnsAddress } from "viem/ens";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

interface MintTokenProps {
  onMint: (address: string, amount: number) => Promise<void>;
  className?: string;
  client: ReturnType<typeof createPublicClient>;
}

export const MintToken: React.FC<MintTokenProps> = ({ onMint, className, client }) => {
  const adminAddress = components.P_GameConfig.get()?.admin;
  const [address, setAddress] = useState<Hex | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [valid, setValid] = useState<boolean>(true);
  const [input, setInput] = useState<string>(adminAddress ?? "");

  const externalAccount = useAccount();
  const chain = useNetwork().chain;
  const expectedChain = externalAccount.connector?.chains[0];
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  const wrongChain = chain?.id !== expectedChain?.id;
  useEffect(() => {
    const fetchEnsName = async (address: string | null) => {
      if (address?.endsWith(".eth")) {
        const addr = await getEnsAddress(client, { name: address });
        setValid(addr !== null);
        setAddress(addr);
      }

      if (isHex(address) && address.length === 42) {
        setValid(true);
        setAddress(address);
        return;
      }
      setValid(false);
      setAddress(null);
      return;
    };
    fetchEnsName(input);
  }, [input, client]);

  const handleMint = () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      onMint(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  if (!expectedChain) return null;
  const Btn = () =>
    wrongChain ? (
      <Button
        disabled={!switchNetwork || expectedChain.id === chain?.id}
        key={expectedChain.id}
        onClick={() => switchNetwork?.(expectedChain.id)}
        className="btn-secondary grow"
      >
        Switch to {expectedChain.name}
        {isLoading && pendingChainId === expectedChain.id && " (switching)"}
      </Button>
    ) : (
      <Button
        disabled={!valid || !amount || amount === "0" || !address}
        className="btn-secondary grow"
        onClick={handleMint}
      >
        <p>mint</p>
      </Button>
    );

  return (
    <div className={className + " flex flex-col gap-2 h-full"}>
      <input
        type="text"
        className={`py-6 px-2 text-sm bg-base-100 border ${
          valid ? "border-secondary/25 active:border-secondary/25" : "active:border-error border-error bg-error/25"
        }  disabled:opacity-50`}
        placeholder="to"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={wrongChain}
      />
      <input
        type="number"
        className="py-6 px-2 text-sm bg-base-100 border border-secondary/25 w-full disabled:opacity-50"
        placeholder="amount"
        value={amount}
        disabled={wrongChain}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Btn />
    </div>
  );
};
