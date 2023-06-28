import { useEffect, useState } from "react";
import { primodium } from "../game";
import GameUI from "../components/GameUI";
import { useMud } from "../context/MudContext";
import { useAccount } from "src/hooks/useAccount";

export const Game = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const network = useMud();
  const { address } = useAccount();

  useEffect(() => {
    (async () => {
      try {
        if (!network) return;
        await primodium.init(address, network);
        setReady(true);
      } catch (e) {
        console.log(e);
        setError(true);
      }
    })();
  }, [network]);

  if (error) {
    return <div>Phaser Engine Game Error. Refer to console.</div>;
  }

  return (
    <div>
      {!ready && (
        <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Primodium</h1>
            <p className="text-lg">Initializing Game World...</p>
          </div>
        </div>
      )}
      {/* cannot unmount. needs to be visible for phaser to attach to DOM element */}
      <div className={`${ready ? "opacity-100" : "opacity-0"}`}>
        <div id="phaser-container" />
        <GameUI />
      </div>
    </div>
  );
};
