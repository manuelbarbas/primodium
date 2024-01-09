import { useEffect, useState } from "react";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Hex, formatEther } from "viem";
import { Card } from "../core/Card";

interface TransferTokenProps {
  onTransfer: (address: string, amount: bigint) => Promise<void>;
}

export const TransferToken: React.FC<TransferTokenProps> = ({ onTransfer }) => {
  const mud = useMud();
  const { playerAccount } = mud;
  const [input, setInput] = useState<string>("");
  const [valid, setValid] = useState<boolean>(true);
  const [address, setAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    const fetchEnsName = async (address: string | null) => {
      if (address?.endsWith(".eth")) {
        const res = await fetch(`${import.meta.env.PRI_ACCOUNT_LINK_VERCEL_URL}/ens/by-name/${address}`);
        const { address: addr } = (await res.json()) as { address: Hex; ensName: string | null };
        setValid(addr !== null);
        setAddress(addr);
        if (addr !== null) return;
      }

      if (address?.startsWith("0x") && address.length === 42) {
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

  const balance = components.WETHBalance.use(playerAccount.entity)?.value ?? 0n;

  const handleTransfer = async () => {
    const amountBigInt = BigInt(Number(amount) * 1e18);
    if (address && amountBigInt > 0) {
      await onTransfer(address, amountBigInt);
      setAmount("");
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <Card className="bg-base-100 gap-2">
      <p className="text-xs opacity-50 font-bold uppercase flex gap-2 items-center">transfer weth</p>
      <div className="relative flex items-center">
        <input
          type="text"
          className={`p-4 text-sm bg-base-100 w-full border font-bold ${
            valid || !input
              ? "border-secondary/25 active:border-secondary/25"
              : "active:border-error border-error bg-error/25"
          }  disabled:opacity-50`}
          placeholder="ENTER ADDRESS OR ENS"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <div className="relative flex items-center">
        <div className="absolute right-2 text-xs flex flex-col items-end">
          <Button
            tooltip={`${formatEther(balance)} wETH`}
            tooltipDirection="top"
            className="btn-primary btn-xs disabled:opacity-50"
            disabled={formatEther(balance) === amount}
            onClick={() => setAmount(formatEther(balance))}
          >
            max
          </Button>
        </div>
        <input
          type="number"
          className="p-4 text-sm bg-base-100 border border-secondary/25 w-full disabled:opacity-50 font-bold uppercase"
          placeholder="amount"
          value={amount}
          onChange={(e) => {
            const value = BigInt(e.target.value);
            const bal = BigInt(balance) / BigInt(1e18);
            if (value < 0) {
              setAmount("");
              return;
            }
            if (value > bal) {
              return;
            }
            setAmount(e.target.value);
          }}
        />
      </div>
      <Button
        disabled={!valid || !amount || amount === "0" || !address}
        className="btn-secondary grow"
        onClick={handleTransfer}
      >
        <p>transfer</p>
      </Button>
    </Card>
  );
};
