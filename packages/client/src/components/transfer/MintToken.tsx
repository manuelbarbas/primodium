import { useEffect, useState } from "react";
import { components } from "src/network/components";
import { Hex, isHex } from "viem";

interface MintTokenProps {
  onMint: (address: string, amount: bigint) => Promise<void>;
  className?: string;
}

export const MintToken: React.FC<MintTokenProps> = ({ onMint, className }) => {
  const adminAddress = components.P_GameConfig.get()?.admin;
  const [address, setAddress] = useState<Hex | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [valid, setValid] = useState<boolean>(true);
  const [input, setInput] = useState<string>(adminAddress ?? "");

  useEffect(() => {
    const fetchEnsName = async (address: string | null) => {
      if (address?.endsWith(".eth")) {
        const res = await fetch(`${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/ens/by-name/${address}`);
        const { address: addr } = (await res.json()) as { address: Hex; ensName: string | null };

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
  }, [input]);

  const handleMint = async (amount: string | number, address: Hex | null) => {
    const amountBigInt = BigInt(Math.round(Number(amount)));
    const amountNum = amountBigInt * BigInt(1e18);
    try {
      if (address && amountNum > 0) {
        await onMint(address, amountNum);
      } else {
        throw new Error("Invalid address or amount");
      }
    } catch (e) {
      console.log(`${address} failed: ${e}`);
    }
  };

  const Btn = () => (
    <button
      disabled={!valid || !amount || amount === "0" || !address}
      className="btn-secondary "
      onClick={() => {
        handleMint(amount, address);
      }}
    >
      <p>mint</p>
    </button>
  );

  return (
    <div className={className + " grid grid-rows-4 gap-2 h-full"}>
      <input
        type="text"
        className={`py-6 px-2 text-sm rounded-md bg-base-100 border ${
          valid ? "border-secondary/25 active:border-secondary/25" : "active:border-error border-error bg-error/25"
        }  disabled:opacity-50`}
        placeholder="to"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <input
        type="number"
        className="py-6 px-2 text-sm bg-base-100 rounded-md border border-secondary/25 w-full disabled:opacity-50"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Btn />
    </div>
  );
};
