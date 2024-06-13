import { EntityToUnitImage } from "@/util/image";
import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { FaRegCopyright } from "react-icons/fa";
import { EntityType } from "@primodiumxyz/core";

const params = new URLSearchParams(window.location.search);
export const Landing: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AnimatePresence key="animate-2">
      <motion.div
        key="play"
        // initial={{ scale: 0.5, opacity: 0, y: 50 }}
        // animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5 } }}
        className="flex items-center justify-center h-screen text-white animate-in fade-in duration-1000"
      >
        <div className="relative text-center border border-secondary/25 px-24 py-16 bg-neutral/50 flex flex-col items-center gap-2 mb-4">
          <div className="absolute top-0 w-full h-full heropattern-topography-slate-700/10" />
          <h1 className="text-8xl font-bold uppercase stroke stroke-white stroke-4 z-10">Primodium</h1>
          <h1 className="text-8xl font-bold uppercase text-accent z-5 -mt-[6.2rem] opacity-75 z-1">Primodium</h1>
          <h1 className="text-8xl font-bold uppercase text-secondary -mt-[6.15rem] opacity-75 z-0">Primodium</h1>
          <h3 className="text-2xl font-bold uppercase text-accent z-0">V0.11: Battle of the Shards</h3>
          <div className="w-4/5 relative flex flex-col items-center gap-2 h-52">
            <img
              src={"/img/wormholebase.png"}
              className=" w-56 pixel-images opacity-75 scale-x-[-1] absolute bottom-2 margin-auto z-20"
            />

            <motion.img
              // initial={{ x: "50%", y: "-50%" }}
              animate={{
                y: "-3px",
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3,
                },
              }}
              src={ResourceImages.Primodium}
              style={{
                filter:
                  "drop-shadow( 1px  0px 0px rgba(0, 255, 255, 0.5)) drop-shadow(-1px  0px 0px rgba(0, 255, 255, 0.5)) drop-shadow( 0px  1px 0px rgba(0, 255, 255, 0.5)) drop-shadow( 0px -1px 0px rgba(0, 255, 255, 0.5))",
              }}
              className=" w-10 pixel-images scale-x-[-1] absolute top-1 mix-blend-screen margin-auto z-30"
            />
            <div className="absolute bg-gray-900 blur-[15px] w-56 h-32 margin-auto bottom-0 z-10" />
          </div>

          {children}

          <div className="absolute bottom-0 right-0 p-2 font-bold opacity-50">
            {params.get("version") ?? ""}
            {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
          </div>
          {/* SHIPS */}
          <motion.img
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-45%",
              x: "44%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4,
                delay: 0.5,
              },
            }}
            src={EntityToUnitImage[EntityType.StingerDrone]}
            className="absolute top-0 right-0 p-0 w-32 pixel-images opacity-75"
          />
          <motion.img
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-53%",
              x: "47%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
                delay: 1,
              },
            }}
            src={EntityToUnitImage[EntityType.StingerDrone]}
            className="absolute -top-10 -right-24 p-0 w-14 pixel-images opacity-25"
          />
          <motion.img
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-53%",
              x: "53%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                delay: 0,
              },
            }}
            src={EntityToUnitImage[EntityType.HammerDrone]}
            className="absolute top-10 -right-24 translate-x-full -translate-y-1/2 p-0 w-16 pixel-images opacity-50"
          />
          <motion.img
            initial={{ x: "-100%", y: "-50%", scale: "75%" }}
            animate={{
              y: "-45%",
              x: "-96%",
              rotateX: 10,
              rotateY: 10,
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 5,
                delay: 0,
              },
            }}
            src={InterfaceIcons.ShardSprite}
            className="absolute -top-0 left-24 p-0 w-44 pixel-images"
          />
          <div className="w-full h-full absolute top-0 overflow-hidden"></div>
        </div>
      </motion.div>
      <div className="fixed bottom-10 w-screen left-0 text-center flex flex-row justify-center items-center gap-2 uppercase font-bold">
        <FaRegCopyright size={12} /> 2024 Primodium
      </div>
    </AnimatePresence>
  );
};
