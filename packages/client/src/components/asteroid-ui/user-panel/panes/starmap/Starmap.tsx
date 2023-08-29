import { primodium } from "@game/api";
import { BeltMap } from "@game/constants";
import { useEffect } from "react";
import { useElementSize } from "src/hooks/useElementSize";

type StarmapViewProps = {
  id: string;
};

export const Starmap: React.FC<StarmapViewProps> = ({ id }) => {
  const { setTarget, setResolution } = primodium.api(BeltMap.KEY)!.game;
  const [elementRef, { width, height }] = useElementSize();

  useEffect(() => {
    setTarget(id);
  }, []);

  useEffect(() => {
    if (!width || !height) return;

    setResolution(
      width * window.devicePixelRatio,
      height * window.devicePixelRatio
    );
  }, [width, height]);

  return (
    <div className="relative w-full h-full bg-gray-800">
      <div className="absolute inset-0 pointer-events-none" />

      {/* Tile Background */}
      <div
        id={id}
        ref={elementRef}
        className="w-full h-full"
        style={{
          opacity: 1,
          backgroundImage: "url(/img/backgrounds/star.png)",
        }}
      />
    </div>
  );
};
