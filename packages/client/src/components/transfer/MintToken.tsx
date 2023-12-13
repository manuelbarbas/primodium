import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useEffect, useState } from "react";
import { FaBacon } from "react-icons/fa";
import { toast } from "react-toastify";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Hex, createPublicClient, getContract, isHex } from "viem";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import data from "./airdrop.json";

interface MintTokenProps {
  onMint: (address: string, amount: bigint) => Promise<void>;
  className?: string;
  client: ReturnType<typeof createPublicClient>;
}

export const MintToken: React.FC<MintTokenProps> = ({ onMint, className, client }) => {
  const adminAddress = components.P_GameConfig.get()?.admin;
  const { network } = useMud();
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
  }, [input, client]);

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

  const handleAirdrop = async (data: { address: string; amount: number }[]) => {
    const confirmAirdrop = confirm("Are you sure you want to execute the airdrop?");
    const tokenAddress = components.P_GameConfig2.get()?.wETHAddress;
    if (!confirmAirdrop || !tokenAddress) return;
    const tokenContract = getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient: network.publicClient,
      walletClient: network.walletClient,
    });
    for (const { address, amount } of data) {
      try {
        await tokenContract.write.mint([address as Hex, BigInt(amount * 1e18)]);
        toast.success(`Airdropped ${amount} to ${address}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        toast.error(`airdrop ${amount} to ${address} failed`);
        console.log(`airdrop to ${address} failed.\n${e}`);
      }
    }
  };

  if (!expectedChain) return null;
  const Btn = () =>
    wrongChain ? (
      <button
        disabled={!switchNetwork || expectedChain.id === chain?.id}
        key={expectedChain.id}
        onClick={() => switchNetwork?.(expectedChain.id)}
        className="btn-secondary "
      >
        Switch to {expectedChain.name}
        {isLoading && pendingChainId === expectedChain.id && " (switching)"}
      </button>
    ) : (
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
        disabled={wrongChain}
      />
      <input
        type="number"
        className="py-6 px-2 text-sm bg-base-100 rounded-md border border-secondary/25 w-full disabled:opacity-50"
        placeholder="amount"
        value={amount}
        disabled={wrongChain}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Btn />
      <button
        disabled={!switchNetwork || expectedChain.id !== chain?.id}
        className="btn-error disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        onClick={() => {
          handleAirdrop(data);
        }}
      >
        <FaBacon />
        <FaBacon />
        <FaBacon />
        <FaBacon />
        <FaBacon />
        <p className="font-bold">AIRDROP</p>
        <FaBacon />
        <FaBacon />
        <FaBacon />
        <FaBacon />
        <FaBacon />
      </button>
    </div>
  );
};
