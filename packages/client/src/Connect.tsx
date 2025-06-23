import { chunk } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Address } from "viem";
import { useAccount, useConnect, useSignMessage, useSwitchChain } from "wagmi";

import { getRandomNonce, verifySignature } from "@primodiumxyz/core";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
// Import Core here!
import Core from "@/Core"; // Import Core now that Connect will render it
import { Landing } from "@/screens/Landing";

const connectorIcons: Record<string, string> = {
  ["MetaMask"]: "/img/icons/web3/metamask.svg",
  ["WalletConnect"]: "/img/web3/walletconnect.svg",
  ["Coinbase Wallet"]: "/img/icons/web3/coinbase.svg",
};

const TARGET_CHAIN_ID = 37084624;
const TARGET_CHAIN_NAME = "[S] Nebula Gaming Hub";

const API_BASE_URL = "http://0.0.0.0:3001";

const JWT_STORAGE_KEY = "authToken";

function setAuthToken(token: string, expiresIn: number) {
  localStorage.setItem(JWT_STORAGE_KEY, token);
  localStorage.setItem(`${JWT_STORAGE_KEY}_expiry`, String(Date.now() + expiresIn * 1000));
}

function getAuthToken(): string | null {
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  const expiry = localStorage.getItem(`${JWT_STORAGE_KEY}_expiry`);
  if (token && expiry && Date.now() < Number(expiry)) {
    return token;
  }
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(`${JWT_STORAGE_KEY}_expiry`);
  return null;
}

function clearAuthToken() {
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(`${JWT_STORAGE_KEY}_expiry`);
}

export const Connect: React.FC = React.memo(() => {
  const { connector, isConnected, chainId, address } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { noExternalAccount, setNoExternalAccount } = usePersistentStore();
  const [showingToast, setShowingToast] = useState(false);
  const [showingChainToast, setShowingChainToast] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userDeclinedAuth, setUserDeclinedAuth] = useState(false);

  useEffect(() => {
    if (isConnected && chainId === TARGET_CHAIN_ID && getAuthToken()) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [isConnected, chainId]); // Depend on connection and chain state

  useEffect(() => {
    if (error) toast.warn(error.message);
  }, [error]);

  // Check chain when wallet connects
  useEffect(() => {
    if (isConnected && chainId && chainId !== TARGET_CHAIN_ID && !showingChainToast) {
      showChainSwitchToast();
    }
  }, [isConnected, chainId, showingChainToast]);

  const authenticateWallet = useCallback(
    async (walletAddress: Address) => {
      if (isAuthenticating || userDeclinedAuth) return;
      setIsAuthenticating(true);
      setUserDeclinedAuth(false); // Reset this flag for a new attempt

      try {
        console.log("WALLET ", walletAddress);

        const nonce = await getRandomNonce(`${API_BASE_URL}/api/auth/nonce?address=`, walletAddress);
        console.log("Received nonce:", nonce);

        const signature = await signMessageAsync({ message: nonce });
        console.log("Generated signature:", signature);

        const { token, expiresIn } = await verifySignature(`${API_BASE_URL}/api/auth/verify`, walletAddress, signature);

        setAuthToken(token, expiresIn);
        setIsAuthenticated(true);
      } catch (authError: Error | unknown) {
        clearAuthToken();
        setIsAuthenticated(true);
        setUserDeclinedAuth(true);
      }
    },
    [signMessageAsync, isAuthenticating, userDeclinedAuth],
  );

  // Automatic authentication trigger
  useEffect(() => {
    if (
      isConnected &&
      address &&
      chainId === TARGET_CHAIN_ID &&
      !isAuthenticated &&
      !isAuthenticating &&
      !userDeclinedAuth &&
      !getAuthToken()
    ) {
      authenticateWallet(address);
    }
  }, [isConnected, address, chainId, isAuthenticated, isAuthenticating, userDeclinedAuth, authenticateWallet]);

  useEffect(() => {
    if (noExternalAccount && address) {
      console.log("address ", address);
      authenticateWallet(address);
    }
  }, [noExternalAccount, address]);

  const showChainSwitchToast = async () => {
    toast.dismiss();
    if (showingChainToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingChainToast(true);

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            <div>WRONG NETWORK. Switch to {TARGET_CHAIN_NAME} to continue.</div>
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await switchChain({ chainId: TARGET_CHAIN_ID });
                  closeToast && closeToast();
                } catch (error) {
                  console.error("Failed to switch chain:", error);
                  toast.error("Failed to switch network. Please switch manually in your wallet.");
                }
              }}
            >
              {`Switch to`} <br /> {`${TARGET_CHAIN_NAME}`}
            </button>
            <button
              onClick={() => {
                setShowingChainToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      },
    );
  };

  const confirmToast = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to login as guest? You will not be able to win prizes or play across devices.
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                setNoExternalAccount(true);
                closeToast && closeToast();
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowingToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-primary btn-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      },
    );
  };

  const handleConnectorClick = async (connectorToConnect: (typeof connectors)[0]) => {
    if (isPending) return;

    try {
      await connect({ connector: connectorToConnect });
      // Reset userDeclinedAuth flag on a new connection attempt
      setUserDeclinedAuth(false);
    } catch (error) {
      console.error("Connection failed:", error);
      toast.error("Failed to connect wallet.");
    }
  };

  // Determine if Core should be rendered
  const shouldRenderCore = isConnected && chainId === TARGET_CHAIN_ID && isAuthenticated;

  if (shouldRenderCore) {
    console.log("noExternalAccount ", noExternalAccount);
    console.log("isConnected ", isConnected);
    console.log("isAuthenticated ", isAuthenticated);

    return <Core />; // Render Core once all conditions are met
  }

  // Otherwise, render the Connect UI
  return (
    <Landing>
      <div className="flex flex-col gap-2 w-full">
        <button
          className="btn-lg btn-secondary star-background w-full btn join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
          onClick={confirmToast}
        >
          Quick Login
        </button>

        {chunk(
          connectors.filter((x) => x.id !== connector?.id),
          2,
        ).map((chunk, i) => (
          <div key={`chunk-${i}`} className="flex flex-row gap-2">
            {chunk.map((x) => (
              <button
                className="flex-1 items-center justify-center btn btn-secondary star-background join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
                key={`${x.id}-${x.name}`}
                onClick={() => handleConnectorClick(x)}
                disabled={isPending}
              >
                <div className="flex w-full items-center justify-center gap-2">
                  {connectorIcons[x.name] && <img src={connectorIcons[x.name]} className="w-6 h-6" />}
                  {x.name}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </Landing>
  );
});
