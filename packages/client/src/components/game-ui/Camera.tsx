import { primodium } from "@game/api";
import { FaCircle } from "react-icons/fa";
import { useMud } from "src/hooks/useMud";
import { useAccount } from "src/hooks/useAccount";
import { useGameStore } from "src/store/GameStore";

export const Camera = () => {
  const network = useMud();
  const crtEffect = useGameStore((state) => state.crtEffect);
  const { address } = useAccount();
  const { worldCoord, normalizedZoom } = primodium.hooks.useCamera(network);
  const blockNumber = primodium.hooks.useBlockNumber();

  return (
    <div
      style={{
        filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))",
      }}
      className="fixed top-0 bottom-0 screen-container pointer-events-none "
    >
      <div className="[&>*]:absolute [&>*]:m-2 [&>*]:border-cyan-400/80 [&>*]:w-12 [&>*]:h-12">
        <div
          className={`top-0 left-0 border-l-2 border-t-2 ${
            crtEffect ? "-skew-x-2 -skew-y-2" : ""
          }`}
        />
        <div
          className={`top-0 right-0 border-r-2 border-t-2 ${
            crtEffect ? "-skew-x-2 -skew-y-2" : ""
          }`}
        />
        <div
          className={`bottom-0 left-0 border-l-2 border-b-2 ${
            crtEffect ? "-skew-x-2 -skew-y-2" : ""
          }`}
        />

        <div
          className={`bottom-0 right-0 border-r-2 border-b-2 ${
            crtEffect ? "-skew-x-2 -skew-y-2" : ""
          }`}
        />
      </div>
      <div
        style={{ textShadow: "2px 2px rgb(147 197 253 / 0.2)" }}
        className={`absolute bottom-8 right-8 text-right font-mono text-cyan-400/80 text-sm font-bold ${
          crtEffect ? "-skew-x-2 -skew-y-2" : ""
        }`}
      >
        <p>x{Math.floor(normalizedZoom)}</p>
        <p>{`[${worldCoord.x}, ${worldCoord.y}]`}</p>
      </div>
      <div
        className={`absolute bottom-8 left-8 text-right font-mono text-cyan-400/80 text-sm font-bold ${
          crtEffect ? "-skew-x-2 -skew-y-2" : ""
        }`}
      >
        <p className="flex items-center gap-2">
          <FaCircle className="animate-pulse" />
          {` BLOCK ${blockNumber}`}
        </p>
        {address && (
          <p className="flex items-center gap-2">
            {address.slice(0, 5)}...{address.slice(-4)}
          </p>
        )}
      </div>
      {/* <div className="scanline opacity-10" /> */}
    </div>
  );
};
