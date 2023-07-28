import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import Panzoom, { PanzoomObject, PanzoomEventDetail } from "@panzoom/panzoom";
import { Coord } from "@latticexyz/utils";

// Define the type of the context
interface PanzoomContextType {
  ready: boolean;
  scale: number;
  position: Coord;
  panzoom: PanzoomObject | null;
  pan: (x: number, y: number, relative?: boolean, animate?: boolean) => void;
  ref: React.RefObject<HTMLDivElement> | null;
  viewportSize: Coord;
}

// Create context with initial value
const PanzoomContext = createContext<PanzoomContextType>({
  ready: false,
  panzoom: null,
  scale: 1,
  position: { x: 0, y: 0 },
  ref: null,
  pan: () => {},
  viewportSize: { x: 0, y: 0 },
});

// Create a provider that will hold our panzoom instance
export const PanZoomProvider: React.FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [panzoom, setPanzoom] = useState<PanzoomObject | null>(null);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Coord>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<Coord>({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      const parent = ref.current!.parentElement;

      if (!parent) return;

      const width = parent.offsetWidth;
      const height = parent.offsetHeight;

      setViewportSize({ x: width, y: height });
    };

    if (ref.current) {
      console.log(ref.current);
      const pz = Panzoom(ref.current, {
        canvas: true,
        step: 0.1,
      });
      ref.current.parentElement!.addEventListener("wheel", pz.zoomWithWheel);

      ref.current.addEventListener("panzoomchange", (e) => {
        const event = e as CustomEvent<PanzoomEventDetail>;
        setPosition({ x: event.detail.x, y: event.detail.y });
        setScale(event.detail.scale);
      });

      const parent = ref.current.parentElement;

      if (!parent) return;

      const width = parent.offsetWidth;
      const height = parent.offsetHeight;

      setViewportSize({ x: width!, y: height! });

      ref.current.addEventListener("resize", handleResize);

      setTimeout(() => setPanzoom(pz));
      setTimeout(() => setReady(true));
    }

    return () => {
      if (panzoom) {
        panzoom.destroy();
        ref.current?.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const pan = (x: number, y: number, relative = false, animate = true) => {
    if (!ref.current || !panzoom) return;

    const parent = ref.current.parentElement;

    if (!parent) return;

    const width = parent.offsetWidth;
    const height = parent.offsetHeight;

    panzoom.pan(x + width / 2, y + height / 2, { relative, animate });
  };

  return (
    <PanzoomContext.Provider
      value={{ panzoom, ref, pan, ready, scale, position, viewportSize }}
    >
      {children}
    </PanzoomContext.Provider>
  );
};

// Hook to use panzoom context
export const usePanzoom = (): PanzoomContextType => {
  const context = useContext(PanzoomContext);

  // Memoize the context value to prevent unnecessary re-renders
  const panzoomContext = useMemo(
    () => context,
    [
      context.panzoom,
      context.ref,
      context.ready,
      context.scale,
      context.position,
      context.pan,
    ]
  );

  return panzoomContext;
};
