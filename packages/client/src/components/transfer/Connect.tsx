import { useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/core/Button";
import { noExternalWallet } from "src/network/config/getNetworkConfig";
import { useAccount, useConnect } from "wagmi";

export function Connect() {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();

  useEffect(() => {
    if (error) toast.warn(error.message);
  }, [error]);

  if (isConnected || noExternalWallet) return null;
  return (
    <div className="w-screen h-screen grid place-items-center">
      <div className="card flex flex-col border border-secondary p-2 gap-2 w-72">
        <p className="text-sm">Connect</p>
        {connectors
          .filter((x) => x.ready && x.id !== connector?.id)
          .map((x) => (
            <Button
              className="btn-secondary font-bold w-full"
              key={x.id}
              onClick={() => !isLoading && connect({ connector: x })}
              disabled={isLoading && x.id !== pendingConnector?.id}
            >
              {x.name}
              {isLoading && x.id === pendingConnector?.id && <p className="text-xs">(connecting)</p>}
            </Button>
          ))}
      </div>
    </div>
  );
}
