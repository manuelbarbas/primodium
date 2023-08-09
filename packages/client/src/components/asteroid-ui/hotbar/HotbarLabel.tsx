import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

type Props = {
  icon: string;
  name: string;
  onClick?: () => void;
};

const HotbarLabel: React.FC<Props> = ({ icon, name, onClick }) => {
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
      className="relative flex flex-col items-center mb-2 cursor-pointer"
      onClick={onClick}
    >
      <motion.img
        animate={controls}
        src={icon}
        className={`relative w-5 h-5 pixel-images z-20`}
      />

      <div className="relative px-2 border border-cyan-600">
        <p className="relative font-bold px-2 z-30 shadow-2xl">{name}</p>
        <span className="absolute inset-0 bg-slate-900/90 z-10crt"></span>
      </div>
    </div>
  );
};

export default HotbarLabel;
