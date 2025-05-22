import { bigIntMax } from "@latticexyz/common/utils";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";

interface TransferContextType {
  left: Entity | undefined;
  right: Entity | "newFleet" | undefined;
  deltas: Map<Entity, bigint>;
  moving: { side: "left" | "right"; entity: Entity; count: bigint } | null;
  hovering: "left" | "right" | null;
  errors: { left: string | null; right: string | null };
  flashing: "left" | "right" | null;
  flash: (side: "left" | "right") => void;
  setLeft: (entity: Entity | undefined) => void;
  setRight: (entity: Entity | "newFleet" | undefined) => void;
  setDelta(entity: Entity, count: bigint): void;
  setDeltas(deltas: Map<Entity, bigint>): void;
  setMoving(data: null): void;
  setMoving(data: { side: "left" | "right"; entity: Entity; count: bigint }): void;
  setHovering(data: "left" | "right" | null): void;
  setError(side: "left" | "right", error: string | null): void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

interface TransferContextProviderProps {
  children: ReactNode;
  initialLeft?: Entity;
  initialRight?: Entity | "newFleet";
}

export const TransferContextProvider: React.FC<TransferContextProviderProps> = ({
  children,
  initialLeft,
  initialRight,
}) => {
  const runFlash = useCallback((side: "left" | "right") => {
    const flashTimes = 1;
    const flashInterval = 400;

    for (let i = 0; i < flashTimes; i++) {
      setTimeout(() => {
        setTransferContext((prev) => ({ ...prev, flashing: side }));
        setTimeout(() => {
          setTransferContext((prev) => ({ ...prev, flashing: null }));
        }, flashInterval / 2);
      }, i * flashInterval);
    }
  }, []);

  const [transferContext, setTransferContext] = useState<TransferContextType>({
    left: initialLeft,
    right: initialRight,
    deltas: new Map(),
    hovering: null,
    moving: null,
    flashing: null,
    errors: { left: null, right: null },
    flash: runFlash,
    setLeft: (entity) => setTransferContext((prev) => ({ ...prev, left: entity })),
    setRight: (entity) => setTransferContext((prev) => ({ ...prev, right: entity })),
    setDelta: (entity, count) => setTransferContext((prev) => ({ ...prev, deltas: prev.deltas.set(entity, count) })),
    setDeltas: (deltas) => setTransferContext((prev) => ({ ...prev, deltas })),
    setMoving: (data) =>
      setTransferContext((prev) => {
        if (data === null) return { ...prev, moving: null };
        data.count = bigIntMax(0n, data.count);
        return { ...prev, moving: data };
      }),
    setHovering: (data) => setTransferContext((prev) => ({ ...prev, hovering: data })),
    setError: (side, error) => setTransferContext((prev) => ({ ...prev, errors: { ...prev.errors, [side]: error } })),
  });

  const { setDeltas, setRight, left, right } = transferContext;

  useEffect(() => {
    setDeltas(new Map());
    if (right === "newFleet" && !left) setRight(undefined);
  }, [left, right]);

  return <TransferContext.Provider value={transferContext}>{children}</TransferContext.Provider>;
};

export const useTransfer = (): TransferContextType => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfer must be used within a TransferContextProvider");
  }
  return context;
};
