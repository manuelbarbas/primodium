import { ContractWrite, createBurnerAccount, transportObserver } from "@latticexyz/common";
import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useEffect, useMemo, useState } from "react";
import { Subject } from "rxjs";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { world } from "src/network/world";
import {
  Hex,
  createPublicClient,
  createWalletClient,
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

  const adminAddress = components.P_GameConfig.get()?.admin;
  const cachedPrivateKey = localStorage.getItem(cacheKey);
  const [privateKey, setPrivateKey] = useState<Hex | undefined>((cachedPrivateKey as Hex) ?? undefined);
  const [tempPrivateKey, setTempPrivateKey] = useState<string>("");

  const balance = components.WETHBalance.use(network.playerEntity)?.value ?? 0n;
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
    const write$ = new Subject<ContractWrite>();
    const tokenContract = getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient,
      walletClient,
    });
    return { publicClient, walletClient, tokenContract, account: burnerAccount };
  }, [privateKey, networkConfig.chain]);
  const address = client?.account.address;

  useEffect(() => {
    if (cachedPrivateKey) return;
    setPrivateKey(networkConfig.privateKey);
  }, [networkConfig.privateKey, cachedPrivateKey]);

  return (
    <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
      {(!adminAddress || !client) && <p>loading...</p>}
      {adminAddress && client && (
        <div className="flex flex-col gap-2">
          <p>
            {"admin".padEnd(20, ".")}
            {adminAddress}
          </p>
          <p>
            {"your address".padEnd(20, ".")}
            {client.account.address}
          </p>

          {address !== adminAddress && (
            <>
              <p className="lowercase">You do not have admin privileges.</p>
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
            <>
              <MintToken
                onMint={async (address: string, amount: number) => {
                  await execute(
                    () => client.tokenContract.write.mint([address as Hex, BigInt(amount)]),
                    network,
                    {
                      id: world.registerEntity(),
                    },
                    (receipt) => {
                      console.log(receipt);
                      alert("Minted " + amount + " tokens to " + address);
                    }
                  );
                }}
              />
              <PlayerBalancesTable />
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface MintTokenProps {
  onMint: (address: string, amount: number) => void;
}

const MintToken: React.FC<MintTokenProps> = ({ onMint }) => {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleMint = () => {
    const amountNum = Number(amount) * 1e18;
    if (address && amountNum > 0) {
      onMint(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <div className="p-2 flex flex-col gap-1 border border-green-400 w-96">
      <p>mint</p>
      <input
        type="text"
        className="p-2 border border-green-400 text-xs"
        placeholder="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border border-green-400"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="p-2 bg-green-400 text-white " onClick={handleMint}>
        Mint Token
      </button>
    </div>
  );
};

const PlayerBalancesTable = () => {
  const players = components.WETHBalance.useAll().map((player) => ({
    entity: player,
    balance: components.WETHBalance.get(player)?.value ?? 0n,
  }));
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPlayers = players.filter((player) => player.entity.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="overflow-auto h-96 border border-1 border-green-400">
      <table className="min-w-full text-sm divide-y divide-green-400">
        <thead className="bg-green-400 text-black">
          <tr>
            <th className="flex items-center ml-2 gap-2 text-left font-medium uppercase tracking-wider">
              Address
              <input
                type="text"
                className="bg-transparent font-black placeholder-black p-1 font-light border border-black border-2"
                placeholder="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </th>
            <th className="p-2 text-right font-medium uppercase tracking-wider">Balance (WETH)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-green-400">
          {[...filteredPlayers].map((player) => (
            <tr key={player.entity}>
              <td className="p-2 whitespace-nowrap text-green-400">{trim(player.entity as Hex)}</td>
              <td className="p-2 whitespace-nowrap text-right text-green-400">{formatEther(player.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
