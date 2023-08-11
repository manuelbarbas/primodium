import { motion } from "framer-motion";

export const FleetPane: React.FC<{
  setShowHangar: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setShowHangar }) => {
  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.1 } }}
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="relative flex justify-center items-center bg-slate-900/90 pixel-images border border-cyan-400 p-2"
    >
      <div className="absolute top-0 right-1/2 -translate-y-full translate-x-1/2">
        <p className="px-2 border border-cyan-400 font-bold mb-2">Fleet</p>
      </div>
      <button
        className="border border-cyan-400 hover:bg-cyan-600 ring-cyan-600 bg-slate-800 active:ring transition-all w-fit px-4 py-2 mx-10 my-5"
        onClick={() => setShowHangar(true)}
      >
        ADD UNITS FROM HANGAR
      </button>
    </motion.div>
  );
};
