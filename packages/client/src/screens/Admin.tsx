import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { world } from "src/network/world";
import {
  Hex,
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  fallback,
  formatEther,
  getContract,
  http,
  isHex,
  trim,
  webSocket,
} from "viem";

const cacheKey = "adminPrivateKey";
export function Admin() {
  const { network } = useMud();

  console.log("player address", network.playerEntity);
  const adminAddress = components.P_GameConfig.get()?.admin;
  const cachedPrivateKey = localStorage.getItem(cacheKey);
  const [privateKey, setPrivateKey] = useState<Hex | undefined>((cachedPrivateKey as Hex) ?? undefined);
  const [tempPrivateKey, setTempPrivateKey] = useState<string>("");

  const networkConfig = getNetworkConfig();
  const tokenAddress = components.P_GameConfig2.get()?.wETHAddress;

  const client = useMemo(() => {
    if (!privateKey || !tokenAddress) return;
    const burnerAccount = createBurnerAccount(privateKey as Hex);

    const clientOptions = {
      chain: networkConfig.chain,
      transport: transportObserver(fallback([webSocket(), http()])),
      pollingInterval: 1000,
      account: burnerAccount,
    };
    const publicClient = createPublicClient(clientOptions);
    const walletClient = createWalletClient(clientOptions);
    const tokenContract = getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient,
      walletClient,
    });
    return { publicClient, walletClient, tokenContract, account: burnerAccount };
  }, [privateKey, networkConfig.chain, tokenAddress]);

  const address = client?.account.address;
  const entity = encodeAbiParameters([{ type: "address" }], [address ?? "0x"]) as Entity;
  const balance = components.WETHBalance.use(entity)?.value ?? 0n;
  const isAdmin = address === adminAddress;

  useEffect(() => {
    if (cachedPrivateKey) return;
    setPrivateKey(networkConfig.privateKey);
  }, [networkConfig.privateKey, cachedPrivateKey]);

  if (!client)
    return (
      <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
        <p>loading...</p>
      </div>
    );

  const onMint = async (address: string, amount: number) => {
    await execute(
      () => client.tokenContract.write.mint([address as Hex, BigInt(amount)]),
      network,
      {
        id: world.registerEntity(),
      },
      () => {
        alert("Minted " + formatEther(BigInt(amount)) + " tokens to " + address);
      }
    );
  };

  const onTransfer = async (address: string, amount: number) => {
    await execute(
      () => client.tokenContract.write.transfer([address as Hex, BigInt(amount)]),
      network,
      {
        id: world.registerEntity(),
      },
      () => {
        alert("Transferred " + formatEther(BigInt(amount)) + " tokens to " + address);
      }
    );
  };
  return (
    <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
      {client && (
        <div className="flex flex-col gap-2">
          <p>
            {"address".padEnd(20, ".")}
            {client.account.address}
            {adminAddress === client.account.address && " (admin)"}
          </p>
          <p>
            {"balance".padEnd(20, ".")}
            {formatEther(balance)}
          </p>
          {!isAdmin && (
            <>
              <p className="lowercase">You do not have admin privileges. Sign in as {adminAddress} for access.</p>
              <div className="flex gap-2">
                <input
                  className="w-3/4"
                  placeholder="enter admin private key"
                  onChange={(e) => setTempPrivateKey(e.target.value as Hex)}
                  value={tempPrivateKey}
                />
                <button
                  onClick={() => {
                    if (!isHex(tempPrivateKey) || !tempPrivateKey) return;

                    localStorage.setItem(cacheKey, tempPrivateKey);
                    setPrivateKey(tempPrivateKey);
                    setTempPrivateKey("");
                  }}
                >
                  ok
                </button>
              </div>
            </>
          )}
          {address == adminAddress && (
            <div className="grid grid-cols-4 gap-4">
              <MintToken onMint={onMint} className="col-span-2" />
              <TransferToken onTransfer={onTransfer} className="col-span-2" />
              <PlayerBalancesTable className="col-span-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MintTokenProps {
  onMint: (address: string, amount: number) => void;
  className?: string;
}

interface TransferTokenProps {
  onTransfer: (address: string, amount: number) => void;
  className?: string;
}

const MintToken: React.FC<MintTokenProps> = ({ onMint, className }) => {
  const adminAddress = components.P_GameConfig.get()?.admin;
  const [address, setAddress] = useState<string>(adminAddress ?? "");
  const [amount, setAmount] = useState<string>("");

  const handleMint = () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      onMint(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <div className={className + " flex flex-col gap-1"}>
      <p>mint</p>
      <input
        type="text"
        className="p-2 border border-green-400 bg-black"
        placeholder="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border border-green-400 bg-black"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="p-2 bg-green-400 text-black " onClick={handleMint}>
        mint token
      </button>
    </div>
  );
};

const TransferToken: React.FC<TransferTokenProps> = ({ onTransfer, className }) => {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleTransfer = () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      onTransfer(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <div className={className + " flex flex-col gap-1"}>
      <p>transfer</p>
      <input
        type="text"
        className="p-2 border border-green-400 bg-black"
        placeholder="to"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border border-green-400 bg-black"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="p-2 bg-green-400 text-black " onClick={handleTransfer}>
        transfer token
      </button>
    </div>
  );
};

const PlayerBalancesTable = ({ className }: { className?: string }) => {
  const players = components.WETHBalance.useAll().map((player) => ({
    entity: player,
    balance: components.WETHBalance.get(player)?.value ?? 0n,
  }));
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPlayers = players.filter((player) => player.entity.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={className + " overflow-auto"}>
      <p>balances</p>
      <div className="flex justify-between items-center font-medium p-1 text-black uppercase bg-green-400">
        <div className="flex gap-10 items-center">
          <p>Address</p>
          <input
            type="text"
            className="bg-transparent font-black placeholder-black p-1 text-xs font-light border border-black border-2"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p>Balance (WETH)</p>
      </div>
      {[...filteredPlayers].map((player) => {
        return (
          <div key={`balance-${player.entity}`} className="flex justify-between p-2 whitespace-nowrap text-green-400">
            <p>{trim(player.entity as Hex)}</p>

            <p>{formatEther(player.balance)}</p>
          </div>
        );
      })}
    </div>
  );
};
