import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useSyncStatus } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Loader } from "@/components/core/Loader";

export const LoadingOverlay = ({
  syncId,
  ready = true,
  loadingMessage = "Loading Data",
  errorMessage = "Error syncing data. Please refresh the page.",
  children,
  className,
}: {
  syncId?: Entity;
  ready?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const { loading, error } = useSyncStatus(syncId);

  useEffect(() => {
    if (error) toast.error(errorMessage);
  }, [loading, error, errorMessage]);

  return (
    <div className={className}>
      {children}
      <AnimatePresence>
        {(loading || !ready) && (
          <motion.div
            key={syncId}
            id={syncId}
            initial={{
              opacity: 1,
            }}
            exit={{ opacity: 0, transition: { delay: 1.5, duration: 0.5 } }}
            className="fixed z-[10000] inset-0 pointer-events-auto bg-neutral/50 backdrop-blur-3xl flex flex-col items-center justify-center text-xl uppercase font-bold"
          >
            <Loader />
            {loadingMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
