import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

type Props = {
  icon: string;
  name: string;
  onClick?: () => void;
  active?: boolean;
};

const HotbarLabel: React.FC<Props> = ({ icon, name, onClick, active }) => {
  const controls = useAnimation();

  useEffect(() => {
    async function animateImage() {
      await controls.start({ scale: 2, transition: { duration: 0.2 } });
      controls.start({ scale: 1.5, transition: { duration: 0.2 } });
    }
    animateImage();
  }, [icon]);

  return (
    <div
      className={`relative flex items-center mb-2 cursor-pointer hover:border-2 border-cyan-900 ${
        active
          ? "border border-cyan-400 ring ring-cyan-900 bg-gradient-to-b from-slate-700 to-slate-900/20 bg-slate-700"
          : "bg-slate-900"
      }  p-2 rounded-md transition-all`}
      onClick={onClick}
    >
      <motion.img
        animate={controls}
        src={icon}
        className={`relative w-4 h-4 pixel-images z-20`}
      />

      <p className="relative font-bold px-2 z-30 shadow-2xl text-xs">{name}</p>
    </div>
  );
};

export default HotbarLabel;
