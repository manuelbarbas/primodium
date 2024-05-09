import React, { ReactNode, createContext, useContext, useState } from "react";
import { Entity } from "@latticexyz/recs";

interface TransferContextType {
  from: Entity | null;
  to: Entity | "newFleet" | null;
  deltas: Map<Entity, bigint>;
  dragging: { entity: Entity; count: bigint } | null;
  setFrom: (entity: Entity | null) => void;
  setTo: (entity: Entity | "newFleet" | null) => void;
  setDelta(entity: Entity, count: bigint): void;
  setDeltas(deltas: Map<Entity, bigint>): void;
  setDragging(data: null): void;
  setDragging(data: { entity: Entity; count: bigint }): void;
  reset: () => void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

interface TransferContextProviderProps {
  children: ReactNode;
  initialFrom: Entity | null;
  initialTo: Entity | "newFleet" | null;
}

export const TransferContextProvider: React.FC<TransferContextProviderProps> = ({
  children,
  initialFrom,
  initialTo,
}) => {
  const [transferContext, setTransferContext] = useState<TransferContextType>({
    from: initialFrom,
    to: initialTo,
    deltas: new Map(),
    dragging: null,
    setFrom: (entity) => setTransferContext((prev) => ({ ...prev, from: entity })),
    setTo: (entity) => setTransferContext((prev) => ({ ...prev, to: entity })),
    setDelta: (entity, count) => setTransferContext((prev) => ({ ...prev, deltas: prev.deltas.set(entity, count) })),
    setDeltas: (deltas) => setTransferContext((prev) => ({ ...prev, deltas })),
    setDragging: (data) => setTransferContext((prev) => ({ ...prev, dragging: data })),
    reset: () =>
      setTransferContext((prev) => ({ ...prev, from: initialFrom, to: initialTo, deltas: new Map(), dragging: null })),
  });

  return <TransferContext.Provider value={transferContext}>{children}</TransferContext.Provider>;
};

export const useTransfer = (): TransferContextType => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfer must be used within a TransferContextProvider");
  }
  return context;
};
