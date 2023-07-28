import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import Panzoom, { PanzoomObject } from "@panzoom/panzoom";

// Define the type of the context
interface PanzoomContextType {
  panzoom: PanzoomObject | null;
}

// Create context with initial value
const PanzoomContext = createContext<PanzoomContextType>({ panzoom: null });

// Create a provider that will hold our panzoom instance
export const PanZoom: React.FC<{
  size?: number;
  children: ReactNode | ReactNode[];
}> = ({ size, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [panzoom, setPanzoom] = useState<PanzoomObject | null>(null);

  useEffect(() => {
    if (ref.current) {
      const pz = Panzoom(ref.current);
      ref.current.parentElement!.addEventListener("wheel", pz.zoomWithWheel);
      setPanzoom(pz);
    }

    return () => {
      if (panzoom) {
        panzoom.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-full overflow-hidden">
      <div
        ref={ref}
        style={{
          width: size,
          height: size,
        }}
        className="bg-gray-500 relative flex items-center justify-center"
      >
        <PanzoomContext.Provider value={{ panzoom }}>
          {children}
        </PanzoomContext.Provider>
      </div>
    </div>
  );
};

// Hook to use panzoom context
export const usePanzoom = (): PanzoomContextType => useContext(PanzoomContext);
