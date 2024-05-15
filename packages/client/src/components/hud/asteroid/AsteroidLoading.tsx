import { singletonEntity } from "@latticexyz/store-sync/recs";
import { AnimatePresence, motion } from "framer-motion";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { components } from "@/network/components";
import { Keys } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { Loader } from "@/components/core/Loader";

export const AsteroidLoading = () => {
  const activeRock = components.ActiveRock.use()?.value ?? singletonEntity;
  const syncId = hashEntities(Keys.ACTIVE, activeRock);
  const { loading } = useSyncStatus(syncId);

  return (
    <AnimatePresence>
      {loading && (
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
          Loading Asteroid
        </motion.div>
      )}
    </AnimatePresence>
  );
};
